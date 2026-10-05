import os
import pickle
from datetime import datetime
from typing import Optional

import bcrypt
import numpy as np
import pandas as pd
import requests
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from database import get_db
from models import Movie, MovieRating, User, Viewed, Watchlist

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    same_site="lax",
    https_only=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
)


# Return {"error": "..."} instead of FastAPI's default {"detail": "..."} so
# the existing frontend error handling continues to work.
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse({"error": "Invalid request payload"}, status_code=400)


# ---------- Schemas ----------
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class MovieIdBody(BaseModel):
    id: int


class RatingUpdate(BaseModel):
    movieID: int
    rating: int


# ---------- Auth ----------
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


# ---------- Helpers ----------
def fetch_movie(movie_id: int) -> Optional[dict]:
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json()
    return None


def movie_to_dict(m: Movie) -> dict:
    return {
        "movie_id": m.id,
        "title": m.title,
        "overview": m.overview,
        "poster_path": m.poster_path,
        "release_date": m.release_date.isoformat() if m.release_date else None,
    }


def get_or_create_movie(db: Session, movie_id: int) -> Optional[Movie]:
    movie = db.get(Movie, movie_id)
    if movie:
        return movie
    data = fetch_movie(movie_id)
    if not data:
        return None
    release_date = None
    if data.get("release_date"):
        release_date = datetime.strptime(data["release_date"], "%Y-%m-%d")
    movie = Movie(
        id=movie_id,
        title=data["title"],
        overview=data.get("overview"),
        poster_path=data.get("poster_path"),
        release_date=release_date,
    )
    db.add(movie)
    db.commit()
    return movie


# ---------- Recommendation data (loaded once at import) ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
movies_path = os.path.join(BASE_DIR, "movies_list.pkl")
similarity_path = os.path.join(BASE_DIR, "similarity.pkl")

movies_df: Optional[pd.DataFrame] = None
similarity: Optional[np.ndarray] = None
movies_list = []

try:
    print("Loading pickle files...")
    with open(movies_path, "rb") as f:
        movies_df = pickle.load(f)
    with open(similarity_path, "rb") as f:
        similarity = pickle.load(f)

    if not isinstance(movies_df, pd.DataFrame):
        print("Error: movies_list.pkl should contain a pandas DataFrame")
        movies_df = None
    else:
        movies_list = movies_df["title"].values
        print(f"Loaded {len(movies_df)} movies successfully")

    if not isinstance(similarity, np.ndarray):
        print("Error: similarity.pkl should contain a numpy array")
        similarity = None
    else:
        print(f"Similarity matrix shape: {similarity.shape}")
except FileNotFoundError as e:
    print(f"Error loading pickle files: {e}")
except Exception as e:
    print(f"Error loading pickle files: {e}")


def fetch_poster(movie_id: int) -> Optional[str]:
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=en-US"
        resp = requests.get(url)
        if resp.status_code == 200:
            poster_path = resp.json().get("poster_path")
            if poster_path:
                return f"https://image.tmdb.org/t/p/w500{poster_path}"
        return None
    except Exception as e:
        print(f"Error fetching poster for movie {movie_id}: {e}")
        return None


# ---------- Routes ----------
@app.get("/")
@app.post("/")
def index(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if user_id:
        user = db.get(User, user_id)
        if user:
            return {"status": "logged_in", "username": user.username}
    return {"status": "not_logged_in"}


@app.get("/api/register")
def register_form():
    return {"message": "Registration form"}


@app.post("/api/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=payload.username).first():
        raise HTTPException(status_code=409, detail="Username already exists")
    if db.query(User).filter_by(email=payload.email).first():
        raise HTTPException(status_code=409, detail="Email already exists")

    hashed_pw = bcrypt.hashpw(
        payload.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")
    user = User(username=payload.username, email=payload.email, password=hashed_pw)
    db.add(user)
    db.commit()
    return JSONResponse({"message": "Registration successful"}, status_code=201)


@app.post("/api/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=payload.username).first()
    if not user or not bcrypt.checkpw(
        payload.password.encode("utf-8"), user.password.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    request.session["user_id"] = user.id
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    }


@app.get("/api/user")
def get_user(current: User = Depends(get_current_user)):
    return {
        "user": {
            "id": current.id,
            "username": current.username,
            "email": current.email,
        }
    }


@app.post("/api/logout")
def logout(request: Request, current: User = Depends(get_current_user)):
    request.session.clear()
    return {"message": "Successfully logged out"}


@app.get("/api/watchlist")
def watchlist(current: User = Depends(get_current_user)):
    return [movie_to_dict(m) for m in current.watchlist]


@app.post("/api/watchlist/add")
def add_to_watchlist(
    payload: MovieIdBody,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not payload.id:
        raise HTTPException(status_code=400, detail="TMDB ID is required")

    movie = get_or_create_movie(db, payload.id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found in TMDB")

    existing = (
        db.query(Watchlist)
        .filter_by(user_id=current.id, movie_id=payload.id)
        .first()
    )
    if existing:
        return {"message": "Movie already in watchlist"}

    db.add(Watchlist(user_id=current.id, movie_id=payload.id))
    db.commit()
    return JSONResponse({"message": "Movie added to watchlist"}, status_code=201)


@app.post("/api/watchlist/remove")
def remove_from_watchlist(
    payload: MovieIdBody,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not payload.id:
        raise HTTPException(status_code=400, detail="TMDB ID is required")

    entry = (
        db.query(Watchlist)
        .filter_by(user_id=current.id, movie_id=payload.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Movie not in watchlist")

    db.delete(entry)
    db.commit()
    return {"message": "Movie removed from watchlist"}


@app.get("/api/rating/{movie_id}")
def get_ratings(
    movie_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    user_rating = (
        db.query(MovieRating)
        .filter_by(user_id=current.id, movie_id=movie_id)
        .first()
    )
    return {
        "movieID": movie_id,
        "userRating": user_rating.rating if user_rating else None,
    }


@app.post("/api/rating/update")
def update_rating(
    payload: RatingUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(
            status_code=400, detail="Rating must be an integer between 1 and 5"
        )

    movie = get_or_create_movie(db, payload.movieID)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found in TMDB")

    user_rating = (
        db.query(MovieRating)
        .filter_by(user_id=current.id, movie_id=payload.movieID)
        .first()
    )
    if user_rating:
        user_rating.rating = payload.rating
        user_rating.rated_at = datetime.now()
    else:
        user_rating = MovieRating(
            user_id=current.id, movie_id=payload.movieID, rating=payload.rating
        )
        db.add(user_rating)

    db.commit()
    return {
        "message": "Rating updated successfully",
        "movieId": payload.movieID,
        "userRating": payload.rating,
    }


@app.get("/api/viewed")
def viewed(current: User = Depends(get_current_user)):
    return [movie_to_dict(m) for m in current.viewed]


@app.post("/api/viewed/add")
def add_to_viewed(
    payload: MovieIdBody,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not payload.id:
        raise HTTPException(status_code=400, detail="TMDB ID is required")

    movie = get_or_create_movie(db, payload.id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found in TMDB")

    existed = (
        db.query(Viewed)
        .filter_by(user_id=current.id, movie_id=payload.id)
        .first()
    )
    if existed:
        return {"message": "Movie already in Viewed"}

    db.add(Viewed(user_id=current.id, movie_id=payload.id))
    db.commit()
    return JSONResponse({"message": "Movie added to Viewed"}, status_code=201)


@app.post("/api/viewed/remove")
def remove_from_viewed(
    payload: MovieIdBody,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not payload.id:
        raise HTTPException(status_code=400, detail="TMDB ID is required")

    entry = (
        db.query(Viewed)
        .filter_by(user_id=current.id, movie_id=payload.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Movie not in viewed")

    db.delete(entry)
    db.commit()
    return {"message": "Movie removed from viewed"}


@app.get("/api/recommendations")
def recommend(
    movie: Optional[str] = None,
    current: User = Depends(get_current_user),
):
    if movies_df is None or similarity is None:
        raise HTTPException(
            status_code=500,
            detail="Movie recommendation data not available. Please check if movies_list.pkl and similarity.pkl files exist.",
        )
    if not movie:
        raise HTTPException(status_code=400, detail="Movie parameter is required")

    print(f"Looking for movie: '{movie}'")
    matches = movies_df[movies_df["title"].str.lower() == movie.lower()]

    if matches.empty:
        matches = movies_df[
            movies_df["title"].str.lower().str.contains(movie.lower(), na=False)
        ]
        if matches.empty:
            available = movies_df["title"].tolist()[:10]
            return JSONResponse(
                {
                    "error": f'Movie "{movie}" not found in dataset',
                    "suggestion": "Try one of these available movies",
                    "available_movies": available,
                },
                status_code=404,
            )

    index = matches.index[0]
    print(f"Found movie at index: {index}")
    if index >= len(similarity):
        raise HTTPException(
            status_code=500, detail="Movie index out of bounds in similarity matrix"
        )

    scores = similarity[index]
    distance = sorted(list(enumerate(scores)), reverse=True, key=lambda x: x[1])

    recommendations = []
    for i in distance[1:6]:
        try:
            data = movies_df.iloc[i[0]]
            movie_id = data.get("id", None)
            rec = {
                "title": data["title"],
                "similarity_score": round(float(i[1]), 3),
            }
            if movie_id:
                rec["id"] = int(movie_id)
                poster_url = fetch_poster(movie_id)
                if poster_url:
                    rec["poster"] = poster_url
            recommendations.append(rec)
        except Exception as e:
            print(f"Error processing recommendation {i[0]}: {e}")
            continue

    return {
        "selected_movie": movie,
        "recommendations": recommendations,
        "user_id": current.id,
    }


@app.get("/api/movies")
def get_movies_list(search: str = ""):
    if movies_df is None:
        raise HTTPException(status_code=500, detail="Movie data not available")

    if search:
        filtered = movies_df[
            movies_df["title"].str.lower().str.contains(search.lower(), na=False)
        ]
        titles = filtered["title"].tolist()
    else:
        titles = movies_list.tolist()[:100]

    return {"movies": titles, "total": len(titles)}


@app.get("/api/movie/{movie_title}")
def get_movie_details(
    movie_title: str, current: User = Depends(get_current_user)
):
    if movies_df is None:
        raise HTTPException(status_code=500, detail="Movie data not available")

    data = movies_df[movies_df["title"].str.lower() == movie_title.lower()]
    if data.empty:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie = data.iloc[0]
    details = {"title": movie["title"]}
    if "id" in movie and pd.notna(movie["id"]):
        details["id"] = int(movie["id"])
        poster_url = fetch_poster(details["id"])
        if poster_url:
            details["poster"] = poster_url

    return details


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)

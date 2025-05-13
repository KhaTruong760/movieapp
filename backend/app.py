from flask import Flask, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests 
from flask_cors import CORS
from flask_login import UserMixin, LoginManager, login_user, logout_user, current_user, login_required
from datetime import datetime
import bcrypt
from sqlalchemy.sql import func




app = Flask(__name__)

CORS(app, origins=["*"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:KhaTruong271206.!@localhost/user_logins'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'SOME KEY'

db = SQLAlchemy(app)

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    watchlist = db.relationship('Movie', secondary='watchlist', backref='watchlist_users')
    viewed = db.relationship('Movie', secondary='viewed', backref='viewed_users')
    def __repr__(self):
        return f'<User: {self.username}>'

class Movie(db.Model):
    __tablename__ = 'movies'
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(255), nullable = False)
    overview = db.Column(db.Text)
    poster_path = db.Column(db.String(255))
    release_date = db.Column(db.Date)
    ratings = db.relationship('MovieRating', backref='movie')

class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), primary_key=True)
    added_at = db.Column(db.DateTime, default=db.func.current_timestamp())


class MovieRating(db.Model) :
    __tablename__ = "movie_ratings"
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    rated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Viewed(db.Model) :
    __tablename__ = "viewed"
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key = True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), primary_key=True)
    time_added = db.Column(db.DateTime, default=db.func.current_timestamp())

login_manager = LoginManager()
login_manager.init_app(app)

    

def fetchMovie(id):
    url = f"https://api.themoviedb.org/3/movie/{id}?api_key=29dbd50df36e2810ccad7d394ef8409a"
    response = requests.get(url)
    if response.status_code == 200 :
        return response.json()
    return None


@login_manager.user_loader
def load_user(uid):
    return User.query.get(uid)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Authentication required"}), 401



@app.route('/', methods=['GET', 'POST'])
def index():
    if current_user.is_authenticated:
        return jsonify({"status": "logged_in", "username": current_user.username})
    else:
        return jsonify({"status": "not_logged_in"})

@app.route('/api/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if not username or not password or not email:
            return jsonify({"error": "Missing required fields"}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 409
            
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 409

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        new_user = User(username=username, email=email, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "Registration successful"}), 201
    else:
        return jsonify({"message": "Registration form"}), 200


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401
    
    login_user(user)
    
    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        }
    })

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Successfully logged out"})



@app.route('/api/watchlist', methods=['GET'])
@login_required
def watchlist() :
    user_id = current_user.id
    user = User.query.get(user_id)
    movies = [
        {
            'movie_id': movie.id,
            'title': movie.title,
            'overview': movie.overview,
            'poster_path': movie.poster_path,
            'release_date': movie.release_date.isoformat() if movie.release_date else None           
        } for movie in user.watchlist
    ] 
    return jsonify(movies)

@app.route('/api/watchlist/add', methods=['POST'])
@login_required
def add_to_watchlist():
    user_id = current_user.id
    data = request.get_json()
    movie_id = data.get('id')
    
    if not movie_id:
        return jsonify({'error': 'TMDB ID is required'}), 400
    
    # Check if movie exists in our database
    movie = Movie.query.get(movie_id)
    
    # If movie doesn't exist in our database, fetch and create it
    if not movie:
        movie_data = fetchMovie(movie_id)
        if not movie_data:
            return jsonify({'error': 'Movie not found in TMDB'}), 404
            
        movie = Movie(
            id=movie_id,
            title=movie_data['title'],
            overview=movie_data.get('overview'),
            poster_path=movie_data.get('poster_path'),
            release_date=datetime.strptime(movie_data['release_date'], '%Y-%m-%d') if movie_data.get('release_date') else None
        )
        db.session.add(movie)
        db.session.commit()
    
    # Check if movie is already in user's watchlist
    existing = Watchlist.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if existing:
        return jsonify({'message': 'Movie already in watchlist'}), 200
    
    # Add to watchlist
    watchlist_entry = Watchlist(user_id=user_id, movie_id=movie_id)
    db.session.add(watchlist_entry)
    db.session.commit()
    
    return jsonify({'message': 'Movie added to watchlist'}), 201

@app.route('/api/watchlist/remove', methods=['POST'])
@login_required
def remove_from_watchlist():
    user_id = current_user.id
    data = request.get_json()
    movie_id = data.get('id')
    if not movie_id:
        return jsonify({'error': 'TMDB ID is required'}), 400
    watchlist_entry = Watchlist.query.filter_by(user_id = user_id, movie_id = movie_id).first()
    if not watchlist_entry:
        return jsonify({'error': 'Movie not in watchlist'}), 404

    db.session.delete(watchlist_entry)
    db.session.commit()
    return jsonify({'message': 'Movie removed from watchlist'})



@app.route('/api/rating/<int:movie_id>', methods=['GET'])
@login_required
def get_ratings(movie_id):
    user_id = current_user.id
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404

    user_rating = MovieRating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    
    return jsonify({
        'movieID': movie_id,
        'userRating': user_rating.rating if user_rating else None,
    })

@app.route('/api/rating/update', methods=['POST'])
@login_required
def update_rating():
    user_id = current_user.id 
    data = request.get_json()
    
    # Debug logging for incoming request
    print("Received data:", data)
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    movie_id = data.get('movieID')
    rating = data.get('rating')
    
    print(f"Extracted values - movieID: {movie_id}, rating: {rating}")

    if movie_id is None or rating is None:
        return jsonify({'error': 'Movie ID and rating are required'}), 400

    # Convert to integers for consistency
    try:
        movie_id = int(movie_id)
        rating = int(rating)
    except (ValueError, TypeError):
        return jsonify({'error': 'Movie ID and rating must be valid numbers'}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
    
    movie = Movie.query.get(movie_id)
    if not movie:
        # Movie doesn't exist in our database, fetch and create it
        movie_data = fetchMovie(movie_id)
        if not movie_data:
            return jsonify({'error': 'Movie not found in TMDB'}), 404
            
        movie = Movie(
            id=movie_id,
            title=movie_data['title'],
            overview=movie_data.get('overview'),
            poster_path=movie_data.get('poster_path'),
            release_date=datetime.strptime(movie_data['release_date'], '%Y-%m-%d') if movie_data.get('release_date') else None
        )
        db.session.add(movie)
        db.session.commit()
    
    # Check if user has already rated this movie
    user_rating = MovieRating.query.filter_by(user_id=user_id, movie_id=movie_id).first()

    if user_rating:
        # Update existing rating
        user_rating.rating = rating
        user_rating.rated_at = datetime.now()
    else:
        # Create new rating
        user_rating = MovieRating(user_id=user_id, movie_id=movie_id, rating=rating)
        db.session.add(user_rating)

    db.session.commit()
    
    return jsonify({
        'message': 'Rating updated successfully',
        'movieId': movie_id,
        'userRating': rating,
    })


@app.route('/api/viewed', methods=['GET'])
@login_required
def viewed() :
    user_id = current_user.id
    user = User.query.get(user_id)
    movies = [
        {
            'movie_id': movie.id,
            'title': movie.title,
            'overview': movie.overview,
            'poster_path': movie.poster_path,
            'release_date': movie.release_date.isoformat() if movie.release_date else None           
        } for movie in user.viewed
    ] 
    return jsonify(movies)


@app.route('/api/viewed/add', methods=['POST'])
@login_required
def add_to_viewed() :
    user_id = current_user.id 
    data = request.get_json()
    movie_id = data.get('id')
    
    if not movie_id :
                return jsonify({'error': 'TMDB ID is required'}), 400
    
    movie = Movie.query.get(movie_id)
    if not movie :
        movie_data = fetchMovie(movie_id)

        movie = Movie(
            id = movie_id,
            title = movie_data['title'],
            overview = movie_data.get('overview'),
            poster_path=movie_data.get('poster_path'),
            release_date=datetime.strptime(movie_data['release_date'], '%Y-%m-%d') if movie_data.get('release_date') else None
        )
    db.session.add(movie)
    db.session.commit()

    existed = Viewed.query.filter_by(user_id = user_id, movie_id = movie_id).first()
    if existed :
        return jsonify({'message': 'Movie already in Viewed'}), 200
    
    viewed_entry = Viewed(user_id=user_id, movie_id=movie_id)
    db.session.add(viewed_entry)
    db.session.commit()
    
    return jsonify({'message': 'Movie added to Viewed'}), 201


@app.route('/api/viewed/remove', methods=['POST'])
@login_required
def remove_from_viewed() :
    user_id = current_user.id
    data = request.get_json()
    movie_id = data.get('id')
    if not movie_id:
        return jsonify({'error': 'TMDB ID is required'}), 400
    viewed_entry = Viewed.query.filter_by(user_id = user_id, movie_id = movie_id).first()
    if not viewed_entry:
        return jsonify({'error': 'Movie not in viewed'}), 404

    db.session.delete(viewed_entry)
    db.session.commit()
    return jsonify({'message': 'Movie removed from viewed'})






    



if __name__ == '__main__':
    app.run(debug=True, port=5000)
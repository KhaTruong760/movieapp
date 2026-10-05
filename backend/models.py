from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    password = Column(String(200), nullable=False)

    watchlist = relationship("Movie", secondary="watchlist", backref="watchlist_users")
    viewed = relationship("Movie", secondary="viewed", backref="viewed_users")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    overview = Column(Text)
    poster_path = Column(String(255))
    release_date = Column(Date)

    ratings = relationship("MovieRating", backref="movie")


class Watchlist(Base):
    __tablename__ = "watchlist"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    added_at = Column(DateTime, server_default=func.current_timestamp())


class MovieRating(Base):
    __tablename__ = "movie_ratings"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    rating = Column(Integer, nullable=False)
    rated_at = Column(DateTime, server_default=func.current_timestamp())


class Viewed(Base):
    __tablename__ = "viewed"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    time_added = Column(DateTime, server_default=func.current_timestamp())

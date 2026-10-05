import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from "../services/api";

const StarRating = ({ movieID, initialRating }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(null);
  const [error, setError] = useState(null);

  // Check if movieID is valid at component mount
  useEffect(() => {
    if (movieID === undefined || movieID === null) {
      console.error("StarRating component received invalid movieID:", movieID);
      setError("Invalid movie ID");
    }
  }, [movieID]);

  useEffect(() => {
    const fetchCurrentRating = async () => {
      if (!movieID) {
        console.error("Can't fetch rating: movieID is undefined");
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/rating/${movieID}`, {
          withCredentials: true
        });
        if (response.data && response.data.userRating !== undefined) {
          setRating(response.data.userRating);
        }
      } catch (err) {
        console.error("Error fetching rating:", err);
      }
    };

    if (movieID && initialRating === undefined) {
      fetchCurrentRating();
    }
  }, [movieID, initialRating]);

  const updateRating = async (newRating) => {
    if (!movieID) {
      setError("Cannot rate: Missing movie ID");
      console.error("Cannot update rating: movieID is undefined");
      return;
    }

    setError(null);

    try {
      console.info("Sending rating update:", { movieID, rating: newRating });
      
      const response = await axios.post(
        `${API_URL}/api/rating/update`,
        {
          movieID: Number(movieID),
          rating: Number(newRating)
        },
        {
          withCredentials: true
        }
      );
      
      console.info("Rating update successful:", response.data);
      setRating(newRating);
    } catch (err) {
      console.error("Error updating rating:", err.response?.data || err.message);
      setError("Failed to update rating. Please try again.");
    }
  };

  if (!movieID) {
    return <div className="text-red-500">Error: No movie ID provided</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        {[...Array(5)].map((star, i) => {
          const ratingValue = i + 1;
          return (
            <label key={i}>
              <input
                type="radio"
                name="rating"
                className="appearance-none"
                value={ratingValue}
                onClick={() => updateRating(ratingValue)}
              />
              <FaStar
                size={17}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseOut={() => setHover(null)}
                color={ratingValue <= (hover || rating) ? "var(--color-accent)" : "var(--color-border)"}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default StarRating;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import "./styles.css";

function Home() {
  const auth = useAuth();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [username, setUsername] = useState(null);
  const [cart, setCart] = useState([]);
  const [ratings, setRatings] = useState({}); // State to store ratings
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get("https://zlq4xjudc9.execute-api.ca-central-1.amazonaws.com/recommendation", {
        params: {
          userId: auth.user?.profile?.sub,
        },
        headers: {
          accessToken: auth.user?.id_token,
        },
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      setUsername(auth.user?.profile?.["cognito:username"]);
    }
  }, [auth.isAuthenticated, auth.user]);

  const fetchProducts = async (page) => {
    try {
      const response = await axios.get("https://zlq4xjudc9.execute-api.ca-central-1.amazonaws.com/products", {
        params: {
          page,
          limit: itemsPerPage,
        },
        headers: {
          accessToken: auth.user?.id_token,
        },
      });
      setProducts(response.data.products);
      setTotalPages(Math.ceil(3000 / itemsPerPage));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchProducts(currentPage);
      fetchRecommendations();
    }
  }, [auth.isAuthenticated, currentPage]);

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const handleRatingChange = async (product, rating) => {
    // Check if the product has already been rated
    if (ratings[product.product_asin] === undefined) {
      setRatings((prevRatings) => ({
        ...prevRatings,
        [product.product_asin]: rating,
      }));
    }



    const data = {
      productId: product.product_asin,
      rating: rating,
    };

    // Make the POST request with fetch
    const response = await fetch("https://zlq4xjudc9.execute-api.ca-central-1.amazonaws.com/review?" + new URLSearchParams({
      productId: product.product_asin,
      rating: rating,
  }).toString(), {
      method: "POST",  // HTTP method
      headers: {
        "accessToken": auth.user?.id_token, // Pass the token in Authorization header
      }
    });
  };


  

  const signOutRedirect = () => {
    const clientId = "1kqpsrdup21vkh711qti1dtrj7";
    const logoutUri = process.env.REACT_APP_LOGOUT_URI;
    const cognitoDomain = "https://ca-central-111wzzqvpp.auth.ca-central-1.amazoncognito.com";
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    window.location.href = logoutUrl;
    auth.removeUser();
  };

  const isAdmin = (auth.user?.profile?.["cognito:groups"] && auth.user?.profile?.["cognito:groups"][0] === 'Admin');

  const renderStars = (product) => {
    const currentRating = ratings[product.product_asin] || 0;
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= currentRating ? "filled" : ""}`}
            onClick={() => handleRatingChange(product, star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };


  return (
    
    <div>
      {auth.isAuthenticated && (
        <>
        
          <button onClick={signOutRedirect} className="sign-out-button">
            Sign Out
          </button>
        </>
      )}
      {auth.isAuthenticated ? (
        <>
          <p className="welcome-message">Welcome back, {username}</p>

          <div className="product-container">
            {recommendations.length === 0 ? <></>: <div><h2>We Recommend You will like: </h2>
            
            <h2></h2></div>}


            {recommendations.map((recommendation) => (
              
              <div className="product-card" key={recommendation.product_asin}>
                <img src={recommendation.image} alt={recommendation.title} />
                <h3>{recommendation.title}</h3>
                <p>
                  {recommendation.description
                    ? recommendation.description.length > 100
                      ? `${recommendation.description.substring(0, 100)}...`
                      : recommendation.description
                    : "No description available"}
                </p>
                <p>{recommendation.price ? `$${recommendation.price}` : "Price not available"}</p>
                <p>Rating: {recommendation.average_rating}</p>
                <button onClick={() => addToCart(recommendation)} className="add-to-cart-button">
                  Buy Now
                </button>
              </div>
            ))}
          </div>

          <h2>Our Products:</h2>

          <div className="product-container">
            {products.map((product) => (
              <div className="product-card" key={product.product_asin}>
                <img src={product.image} alt={product.title} />
                <h3>{product.title}</h3>
                <p>
                  {product.description
                    ? product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description
                    : "No description available"}
                </p>
                <p>{product.price ? `$${product.price}` : "Price not available"}</p>
                <p>Rating: {product.average_rating}</p>
                <button onClick={() => addToCart(product)} className="add-to-cart-button">
                  Buy Now
                </button>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>

          <div className="cart-section">
            <h2>Your Purchases</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    {item.title} - {item.price ? `$${item.price}` : "Price not available"}
                    {renderStars(item)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAdmin && (
            <button onClick={() => navigate("/addItem")} className="admin-button">
              Add Item
            </button>
          )}
        </>
      ) : (
        <button onClick={() => auth.signinRedirect()}>Sign In</button>
      )}
    </div>
  );
}

export default Home;
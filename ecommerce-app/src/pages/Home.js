import React, { useEffect, useState } from "react";
import ProductCard from '../components/ProductCard';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Cart from './Cart';
import { useAuth } from "react-oidc-context";
import './styles.css'


const products = [
  { id: 1, name: 'Product 1', price: 19.99, image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Product 2', price: 29.99, image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Product 3', price: 39.99, image: 'https://via.placeholder.com/150' },
];

function Home() {
    const auth = useAuth();
    const [username, setUsername] = useState(null);
  
    useEffect(() => {
      if (auth.isAuthenticated) {
        setUsername(auth.user?.profile?.["cognito:username"]); // Access user email or other info
      }
    }, [auth.isAuthenticated, auth.user]);

    const [cart, setCart] = useState([]);


    const signOutRedirect = () => {
      const clientId = "1kqpsrdup21vkh711qti1dtrj7";  // Your Cognito app client ID
      const logoutUri = "http://localhost:3000";  // Redirect after logout
      const cognitoDomain = "https://ca-central-111wzzqvpp.auth.ca-central-1.amazoncognito.com";
      const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  
      // Redirect the user to Cognito logout endpoint
      window.location.href = logoutUrl;
      auth.removeUser();
    };

    const addToCart = (product) => {
        setCart((prevCart) => [...prevCart, product]);
      };
    
      const removeFromCart = (index) => {
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
      };


    return (
<div>
      {auth.isAuthenticated && (
        <button onClick={signOutRedirect} className="sign-out-button">
          Sign Out
        </button>
      )}
      <h1>Welcome to the Home Page!</h1>
      {auth.isAuthenticated ? (
        <>
          <p className="welcome-message">Welcome back, {username}</p>
          <div className="product-container">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <button onClick={() => addToCart(product)} className="add-to-cart-button">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <div className="cart-section">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    {item.name} - ${item.price}
                    <button onClick={() => removeFromCart(index)} className="remove-button">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <button onClick={() => auth.signinRedirect()}>Sign In</button>
      )}
    </div>
  );

      
    // return (
    //     <div>
    //       <h1>Welcome to the Store</h1>
    //       <div style={{ display: 'flex', gap: '16px' }}>
    //         {products.map((product) => (
    //           <ProductCard key={product.id} product={product} />
    //         ))}
    //       </div>
    //     </div>
    //   );
}


// const Home = () => {
//   return (
//     <div>
//       <h1>Welcome to the Store</h1>
//       <div style={{ display: 'flex', gap: '16px' }}>
//         {products.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>
//     </div>
//   );
// };

export default Home;

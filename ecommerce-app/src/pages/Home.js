// import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import ProductCard from '../components/ProductCard';
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
// import Cart from './Cart';
// import { useAuth } from "react-oidc-context";
// import './styles.css'


// // const products = [
// //   { id: 1, name: 'Product 1', price: 19.99, image: 'https://via.placeholder.com/150' },
// //   { id: 2, name: 'Product 2', price: 29.99, image: 'https://via.placeholder.com/150' },
// //   { id: 3, name: 'Product 3', price: 39.99, image: 'https://via.placeholder.com/150' },
// // ];




// function Home() {
//   const auth = useAuth();
//   const [products, setProducts] = useState([]);
//   const [username, setUsername] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [count, setCount] = useState(5); // Number of products to fetch

// useEffect(() => {
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       setError(null); // Reset error state

//       const accessToken = auth.user?.id_token;
//       const apiUrl = `https://zlq4xjudc9.execute-api.ca-central-1.amazonaws.com/products?page=1&limit=5`;

//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'accessToken': accessToken, // Pass the access token in the header
//           'Content-Type': 'application/json', // Add appropriate content type
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data)
//       setProducts(data); // Update the products state
//     } catch (err) {
//       setError("Failed to fetch products.");
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (auth.isAuthenticated) {
//     fetchProducts();
//   }
// }, [auth, count]); // Refetch products when 'count' changes


//   useEffect(() => {
//     if (auth.isAuthenticated) {
//       setUsername(auth.user?.profile?.["cognito:username"]); // Access user email or other info
//     }
//   }, [auth.isAuthenticated, auth.user]);

//   const [cart, setCart] = useState([]);


//   const signOutRedirect = () => {
//     const clientId = "1kqpsrdup21vkh711qti1dtrj7";  // Your Cognito app client ID
//     const logoutUri = "http://localhost:3000";  // Redirect after logout
//     const cognitoDomain = "https://ca-central-111wzzqvpp.auth.ca-central-1.amazoncognito.com";
//     const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

//     // Redirect the user to Cognito logout endpoint
//     window.location.href = logoutUrl;
//     auth.removeUser();
//   };

//   const addToCart = (product) => {
//     setCart((prevCart) => [...prevCart, product]);
//   };

//   const removeFromCart = (index) => {
//     setCart((prevCart) => prevCart.filter((_, i) => i !== index));
//   };
//   const navigate = useNavigate();

//   const handleAddItem = () => {
//     // Add the item logic here
//     navigate('/addItem'); // Redirect to AddItem page after adding item
//   };

//   console.log(auth);
//   const isAdmin = (auth.user?.profile?.["cognito:groups"] !== 0 && auth.user?.profile?.["cognito:groups"][0] === 'Admin')
//   return (
//     <div>
//       {auth.isAuthenticated && (
//         <>
//           <button onClick={signOutRedirect} className="sign-out-button">
//             Sign Out
//           </button>
//         </>
//       )}
//       {auth.isAuthenticated ? (
//         <>


//           <p className="welcome-message">Welcome back, {username}</p>

//           <div className="product-container">
//             {products.map((product) => (
//               <div className="product-card" key={product.id}>
//                 <img src={product.image} alt={product.name} />
//                 <h3>{product.name}</h3>
//                 <p>${product.price}</p>
//                 <button onClick={() => addToCart(product)} className="add-to-cart-button">
//                   Add to Cart
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="cart-section">
//             <h2>Your Cart</h2>
//             {cart.length === 0 ? (
//               <p>Your cart is empty.</p>
//             ) : (
//               <ul>
//                 {cart.map((item, index) => (
//                   <li key={index} className="cart-item">
//                     {item.name} - ${item.price}
//                     <button onClick={() => removeFromCart(index)} className="remove-button">
//                       Remove
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>


//             {isAdmin ? (
//               <button onClick={() => handleAddItem()} className="admin-button">
//                 Add Item
//               </button>
//             ) : (<></>)}
//         </>
//       ) : (
//         <button onClick={() => auth.signinRedirect()}>Sign Out</button>
//       )}
//     </div>
//   );


//   // return (
//   //     <div>
//   //       <h1>Welcome to the Store</h1>
//   //       <div style={{ display: 'flex', gap: '16px' }}>
//   //         {products.map((product) => (
//   //           <ProductCard key={product.id} product={product} />
//   //         ))}
//   //       </div>
//   //     </div>
//   //   );
// }


// // const Home = () => {
// //   return (
// //     <div>
// //       <h1>Welcome to the Store</h1>
// //       <div style={{ display: 'flex', gap: '16px' }}>
// //         {products.map((product) => (
// //           <ProductCard key={product.id} product={product} />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// export default Home;






import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Cart from './Cart';
import { useAuth } from "react-oidc-context";
import './styles.css';

function Home() {
  const auth = useAuth();
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setUsername(auth.user?.profile?.["cognito:username"]); // Access user email or other info
    }
  }, [auth.isAuthenticated, auth.user]);

  // Fetch products with pagination parameters (page and limit)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://zlq4xjudc9.execute-api.ca-central-1.amazonaws.com/products", {
          params: {
            page: 1, // You can modify this to make it dynamic based on user input
            limit: 100  // Again, you can make this dynamic as well
          },
          headers: {
            accessToken: auth.user?.id_token // Pass the auth token in headers
          }
        });

        // Assuming the API returns the products in the expected format
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [auth.isAuthenticated]);

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

  const navigate = useNavigate();

  const handleAddItem = () => {
    // Add the item logic here
    navigate('/addItem'); // Redirect to AddItem page after adding item
  };

  const isAdmin = (auth.user?.profile?.["cognito:groups"] !== 0 && auth.user?.profile?.["cognito:groups"][0] === 'Admin');

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

          <div className="cart-section">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    {item.title} - {item.price ? `$${item.price}` : "Price not available"}
                    <button onClick={() => removeFromCart(index)} className="remove-button">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAdmin && (
            <button onClick={() => handleAddItem()} className="admin-button">
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


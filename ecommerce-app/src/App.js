import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import { useEffect } from "react";

import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();
  useEffect(() => {
    if (auth.isAuthenticated) {
      // Store tokens in localStorage when user is authenticated
      localStorage.setItem("id_token", auth.user.id_token);
      localStorage.setItem("access_token", auth.user.access_token);
    } else {
      // Clear the tokens when the user logs out
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
    }
  }, [auth.isAuthenticated, auth.user]);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
        <Router>
          <Routes>
            {/* Redirect to /home if authenticated, otherwise show login */}
            <Route
              path="/"
              element={auth.isAuthenticated ? <Navigate to="/home" /> : <Login />}
            />
            {/* Protected routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  );
}


function Login() {
    const auth = useAuth();
  
    return (
      <div>
        <h1>Login</h1>
        <button onClick={() => auth.signinRedirect()}>Sign In</button>
      </div>
    );
  }


  function ProtectedRoute({ children }) {
    const auth = useAuth();
  
    if (!auth.isAuthenticated) {
      return <Navigate to="/" />;
    }
  
    return children;
  }
  
export default App;


// const App = () => {
//   return (
//     <Router>
//       <div>
//         <nav>
//           <Link to="/">Home</Link> | <Link to="/cart">Cart</Link>
//         </nav>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/cart" element={<Cart />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
// import Home from './pages/Home';
// import Cart from './pages/Cart';
// import AddItem from './pages/AddItem';
// import { useEffect } from "react";

// import { useAuth } from "react-oidc-context";

// function App() {
//   const auth = useAuth();

//   useEffect(() => {
//     if (auth.isAuthenticated && auth.user) {
//       localStorage.setItem("id_token", auth.user.id_token);
//       localStorage.setItem("access_token", auth.user.access_token);
//     } else if (!auth.isLoading) {
//       localStorage.removeItem("id_token");
//       localStorage.removeItem("access_token");
//     }
//   }, [auth.isAuthenticated, auth.user]);
//   if (auth.isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (auth.error) {
//     return <div>Encountering error... {auth.error.message}</div>;
//   }



//   if (auth.isAuthenticated) {
//     return (
//         <Router>
//           <Routes>
//             {/* Redirect to /home if authenticated, otherwise show login */}
//             <Route
//               path="/"
//               element={auth.isAuthenticated ? <Navigate to="/home" /> : <Login />}
//             />
//             {/* Protected routes */}
//             <Route
//               path="/home"
//               element={
//                 <ProtectedRoute>
//                   <Home />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/cart"
//               element={
//                 <ProtectedRoute>
//                   <Cart />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/addItem"
//               element={
//                 <ProtectedRoute>
//                   <AddItem />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </Router>
//       );
//   }

//   return (
//     <div>
//       <button onClick={() => auth.signinRedirect()}>Sign in</button>
//     </div>
//   );
// }


// function Login() {
//     const auth = useAuth();
  
//     return (
//       <div>
//         <h1>Login</h1>
//         <button onClick={() => auth.signinRedirect()}>Sign In</button>
//       </div>
//     );
//   }


//   function ProtectedRoute({ children }) {
//     const auth = useAuth();
  
//     if (!auth.isAuthenticated) {
//       return <Navigate to="/" />;
//     }
  
//     return children;
//   }
  
// export default App;


// // const App = () => {
// //   return (
// //     <Router>
// //       <div>
// //         <nav>
// //           <Link to="/">Home</Link> | <Link to="/cart">Cart</Link>
// //         </nav>
// //         <Routes>
// //           <Route path="/" element={<Home />} />
// //           <Route path="/cart" element={<Cart />} />
// //         </Routes>
// //       </div>
// //     </Router>
// //   );
// // };

// // export default App;



import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Home from './pages/Home';
import Cart from './pages/Cart';
import AddItem from './pages/AddItem';

function App() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      localStorage.setItem("id_token", auth.user.id_token);
      localStorage.setItem("access_token", auth.user.access_token);
    } else if (!auth.isLoading) {
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user]);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    console.error('Authentication error:', auth.error);
    if (auth.error.message.includes('No matching state')) {
      auth.signinRedirect(); // Retry the authentication flow
    }
    return <div>Error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/addItem" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
          <Route path="/silent-renew" element={<SilentRenew />} />
        </Routes>
      </Router>
    );
  }

  return <button onClick={() => auth.signinRedirect()}>Sign in</button>;
}

function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
}

function SilentRenew() {
  const auth = useAuth();

  useEffect(() => {
    auth.signinSilentCallback();
  }, [auth]);

  return <div>Silent Renewing...</div>;
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [user, setUser] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        axios.get('http://localhost:5000/') // Backend endpoint
            .then(response => {
                setUser(response.data.user);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const login = () => {
        window.location.href = 'http://localhost:5000/login'; // Redirect to the backend login route
    };

    const logout = () => {
        axios.get('http://localhost:5000/logout')  // Call the backend logout route
            .then(response => {
                setUser(null);
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div>
            {user ? (
                <div>
                    <h1>Welcome, {user.email}</h1>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <div>
                    <h1>Welcome! Please login</h1>
                    <button onClick={login}>Login</button>
                </div>
            )}
        </div>
    );
};

export default App;

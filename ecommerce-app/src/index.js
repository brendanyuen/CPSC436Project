import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // Optional: Add custom CSS styles here
import App from './App';  // Import the App component
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')  // React will inject the App into the 'root' div in index.html
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();

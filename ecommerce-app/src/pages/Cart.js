import React from "react";
import './styles.css';

function Cart({ cart, setCart }) {
  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  return (
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
  );
}

export default Cart;

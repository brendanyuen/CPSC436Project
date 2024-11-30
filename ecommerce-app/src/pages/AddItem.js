import React, { useState } from 'react';

function AddItem() {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');

  const handleAddItem = () => {
    // Logic to add item, e.g., updating state, making an API call, etc.
    console.log('Item added:', itemName, itemDescription);
  };

  return (
    <div>
      <h2>Add Item</h2>
      <div>
        <label>Item Name:</label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
      </div>
      <div>
        <label>Item Description:</label>
        <textarea
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
        />
      </div>
      <button onClick={handleAddItem}>Add Item</button>
    </div>
  );
}

export default AddItem;
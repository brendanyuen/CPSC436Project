// import React, { useState } from "react";

// function AddItem() {
//   const [itemTitle, setItemTitle] = useState("");
//   const [itemDescription, setItemDescription] = useState("");
//   const [itemPrice, setItemPrice] = useState("");
//   const [itemCategory, setItemCategory] = useState(""); // State for category
//   const [itemImage, setItemImage] = useState(null); // State for the image
//   const [imagePreview, setImagePreview] = useState(""); // State for image preview

//   // Updated categories array
//   const categories = [
//     "Musical Instruments",
//     "Industrial & Scientific",
//     "Tools & Home Improvement",
//     "All Beauty",
//     "Amazon Home",
//     "Appliances",
//     "All Electronics",
//     "Software",
//     "Automotive",
//     "AMAZON FASHION",
//     "Health & Personal Care",
//     "Home Audio & Theater",
//     "Cell Phones & Accessories",
//     "Sports & Outdoors",
//     "Computers",
//     "Car Electronics",
//     "Premium Beauty",
//     "Baby",
//     "Camera & Photo",
//     "Arts, Crafts & Sewing",
//     "Toys & Games",
//     "Office Products",
//   ];

//   const handleAddItem = () => {
//     const productId = generateRandomProductId();
//     console.log("Item added:", {
//       id: productId,
//       title: itemTitle,
//       description: itemDescription,
//       price: itemPrice,
//       category: itemCategory,
//       image: itemImage ? itemImage : "No image uploaded",

//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setItemImage(file);
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result); // Set the preview URL
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   function generateRandomProductId(prefix = "PROD", length = 8) {
//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//     let randomId = "";

//     for (let i = 0; i < length; i++) {
//       randomId += chars.charAt(Math.floor(Math.random() * chars.length));
//     }

//     return `${prefix}-${randomId}`;
//   }

//   const [responseData, setResponseData] = useState(null);
//   const [error, setError] = useState(null);

//   const handleButtonClick = async () => {
//     try {
//       const response = await axios.post("https://example.com/api/endpoint", {
//         main_catergory: "value1",
//         key2: "value2",
//       });
//       setResponseData(response.data);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div>
//       <div>
//         <label>Item Title: </label>
//         <input
//           type="text"
//           value={itemTitle}
//           onChange={(e) => setItemTitle(e.target.value)}
//         />
//       </div>
//       <div>
//         <label>Item Description: </label>
//         <textarea
//           value={itemDescription}
//           onChange={(e) => setItemDescription(e.target.value)}
//         />
//       </div>
//       <div>
//         <label>Price: </label>
//         <input
//           type="text"
//           value={itemPrice}
//           onChange={(e) => setItemPrice(e.target.value)}
//         />
//       </div>
//       <div>
//         <label>Category: </label>
//         <select
//           value={itemCategory}
//           onChange={(e) => setItemCategory(e.target.value)}
//         >
//           <option value="" disabled>
//             -- Choose a Category --
//           </option>
//           {categories.map((category, index) => (
//             <option key={index} value={category}>
//               {category}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label>Item Image: </label>
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//         {imagePreview && (
//           <div>
//             <p>Preview:</p>
//             <img
//               src={imagePreview}
//               alt="Preview"
//               style={{ width: "150px", height: "150px", objectFit: "cover" }}
//             />
//           </div>
//         )}
//       </div>
//       <button onClick={handleAddItem}>Add Item</button>
//     </div>
//   );
// }

// export default AddItem;


import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

function AddItem() {

  const auth = useAuth();
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const categories = [
    "Musical Instruments",
    "Industrial & Scientific",
    "Tools & Home Improvement",
    "All Beauty",
    "Amazon Home",
    "Appliances",
    "All Electronics",
    "Software",
    "Automotive",
    "AMAZON FASHION",
    "Health & Personal Care",
    "Home Audio & Theater",
    "Cell Phones & Accessories",
    "Sports & Outdoors",
    "Computers",
    "Car Electronics",
    "Premium Beauty",
    "Baby",
    "Camera & Photo",
    "Arts, Crafts & Sewing",
    "Toys & Games",
    "Office Products",
  ];

  const handleAddItem = async () => {

    if (!itemImage) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("main_category", itemCategory);
    formData.append("title", itemTitle);
    formData.append("price", itemPrice);
    formData.append("description", itemDescription);
    formData.append("image", itemImage);

    try {
      const response = await axios.post(
        "https://zlq4xjudc9.execute-api.ca-central-1.amazonaws.com/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accessToken: auth.user?.id_token, // Add your access token here
          },
        }
      );
      setResponseData(response.data);
      alert("Item added successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error adding item:", err);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoHome = () => {
    navigate("/"); // Navigate to the home page
  };

  return (
    <div>
      <div>
        <label>Item Title: </label>
        <input
          type="text"
          value={itemTitle}
          onChange={(e) => setItemTitle(e.target.value)}
        />
      </div>
      <div>
        <label>Item Description: </label>
        <textarea
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Price: </label>
        <input
          type="number"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          step="0.01" // Allows for decimal values
          min="0" // Prevents negative values
        />
      </div>
      <div>
        <label>Category: </label>
        <select
          value={itemCategory}
          onChange={(e) => setItemCategory(e.target.value)}
        >
          <option value="" disabled>
            -- Choose a Category --
          </option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Item Image: </label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <div>
            <p>Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          </div>
        )}
      </div>
      <button onClick={handleAddItem}>Add Item</button>
      <button onClick={handleGoHome}>Go to Home Page</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default AddItem;

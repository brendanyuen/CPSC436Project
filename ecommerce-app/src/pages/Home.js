import React from 'react';
import ProductCard from '../components/ProductCard';

const products = [
  { id: 1, name: 'Product 1', price: 19.99, image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Product 2', price: 29.99, image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Product 3', price: 39.99, image: 'https://via.placeholder.com/150' },
];

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Store</h1>
      <div style={{ display: 'flex', gap: '16px' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;

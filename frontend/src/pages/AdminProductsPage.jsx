import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../features/products/productsSlice'; 

import './AdminProductsPage.css';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  quantity: '',
  description:'',
  inStock: false,
};

const AdminProductsPage = () => {
  
  const dispatch = useDispatch();
  
  const { items: products, status, error } = useSelector((state) => state.products);

  
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
   const [localError, setLocalError] = useState(''); 

  
  useEffect(() => {
    
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);


 
  const handleSubmit = async (e) => {
    e.preventDefault();
     
     setLocalError('');
   if (parseFloat(form.price) < 0 || parseInt(form.quantity, 10) < 0) {
      setLocalError('Price and Quantity cannot be negative.');
      return; // Stop the submission
    } 
    if (editingId) {
      
      await dispatch(updateProduct({ id: editingId, data: form }));
    } else {
      // Dispatch the create thunk
      await dispatch(createProduct(form)); // Assuming you create this thunk
    }
    // No need to manually call loadProducts(), the store will update automatically
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (p) => {
    setForm(p);
    setEditingId(p.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    // Dispatch the delete thunk
    await dispatch(deleteProduct(id));
  };


  // --- STEP 5: Use Redux Status for UI Feedback ---
  return (
    <div className="admin-container">
      <h1 className="admin-title"> Admin – Product Manager</h1>

      {status === 'failed' && <p className="error-msg">{error}</p>}
      {status === 'loading' && <p>Loading...</p>}

      <form className="product-form" onSubmit={handleSubmit}>
        {/* The form JSX remains the same, which is great! */}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          
        />

         <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          
        />
        <input
          type="number"
          placeholder="Price"
           min="0" 
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
           min="0" 
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          required
        />
        
        <button type="submit" disabled={status === 'loading'}>
            {editingId ? 'Update' : 'Add'} Product
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
          }}>
            Cancel
          </button>
        )}
      </form>

      <table className="product-table">
        {/* The table JSX also remains the same! */}
        <thead>
          <tr>
            <th>Name</th><th>Category</th><th>Description</th><th>Price</th><th>Qty</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.description}</td>
              <td>${p.price}</td>
              <td>{p.quantity}</td>
              <td>{p.inStock ? '✅' : '❌'}</td>
             <td>
  <div className="action-buttons">
    <button onClick={() => handleEdit(p)}>Edit</button>
    <button onClick={() => handleDelete(p.id)}>Delete</button>
  </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductsPage;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const res = await api.get('/cart');
  return res.data.data;
});

export const addToCart = createAsyncThunk('cart/addToCart', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/add', payload);
    toast.success('Added to cart!');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId) => {
  const res = await api.delete(`/cart/${itemId}`);
  return res.data.data;
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ itemId, quantity }) => {
  const res = await api.put(`/cart/${itemId}`, { quantity });
  return res.data.data;
});

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/apply-coupon', { code });
    toast.success(`Coupon ${code} applied! Saving ₹${res.data.data.discount}`);
    return res.data.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid coupon');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const resetCart = createAsyncThunk('cart/resetCart', async () => {
  await api.delete('/cart');
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:          [],
    subtotal:       0,
    couponCode:     null,
    couponDiscount: 0,
    loading:        false,
  },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      if (!action.payload) return;
      state.items    = action.payload.items    || [];
      state.subtotal = action.payload.subtotal || 0;
      state.couponCode     = action.payload.couponCode     || null;
      state.couponDiscount = action.payload.couponDiscount || 0;
    };
    builder
      .addCase(fetchCart.fulfilled,      setCart)
      .addCase(addToCart.fulfilled,      setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponCode     = action.payload.code;
        state.couponDiscount = action.payload.discount;
      })
      .addCase(resetCart.fulfilled, (state) => {
        state.items = []; state.subtotal = 0;
        state.couponCode = null; state.couponDiscount = 0;
      });
  },
});

export const selectCartItems    = (state) => state.cart.items;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartCount    = (state) => state.cart.items.reduce((s, i) => s + i.quantity, 0);

export default cartSlice.reducer;

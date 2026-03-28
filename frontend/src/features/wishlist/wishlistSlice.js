import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await api.get('/wishlist');
  return res.data.data;
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist/toggle', { productId });
    if (res.data.added) toast.success('Added to wishlist ❤️');
    else toast.info('Removed from wishlist');
    return { productId, added: res.data.added };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items:   [],   // full product objects (when fetched)
    ids:     [],   // just ids (for fast lookup)
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.ids   = action.payload.map((p) => p._id || p);
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, added } = action.payload;
        if (added) {
          if (!state.ids.includes(productId)) state.ids.push(productId);
        } else {
          state.ids   = state.ids.filter((id) => id !== productId);
          state.items = state.items.filter((p) => (p._id || p) !== productId);
        }
      });
  },
});

export const selectWishlistIds = (state) => state.wishlist.ids;
export default wishlistSlice.reducer;

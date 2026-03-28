import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    filters: {
      q:          '',
      category:   '',
      minPrice:   '',
      maxPrice:   '',
      fabric:     [],
      occasion:   [],
      colors:     [],
      workType:   '',
      rating:     '',
      isFeatured: '',
      isTrending: '',
      sort:       '-createdAt',
      page:       1,
      limit:      12,
    },
    recentlyViewed: [],
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = { ...productSlice.getInitialState().filters };
    },
    addRecentlyViewed: (state, action) => {
      const product = action.payload;
      state.recentlyViewed = [
        product,
        ...state.recentlyViewed.filter((p) => p._id !== product._id),
      ].slice(0, 12);
    },
  },
});

export const { setFilter, setPage, resetFilters, addRecentlyViewed } = productSlice.actions;
export default productSlice.reducer;

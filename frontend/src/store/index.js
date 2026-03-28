import { configureStore } from '@reduxjs/toolkit';
import authReducer     from '../features/auth/authSlice';
import cartReducer     from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import uiReducer       from '../features/ui/uiSlice';
import productReducer  from '../features/products/productSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    cart:     cartReducer,
    wishlist: wishlistReducer,
    ui:       uiReducer,
    products: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST'] } }),
});

export default store;

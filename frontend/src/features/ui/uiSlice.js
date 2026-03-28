import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartDrawerOpen:   false,
    searchOverlayOpen:false,
    mobileMenuOpen:   false,
  },
  reducers: {
    openCartDrawer:    (state) => { state.cartDrawerOpen = true; },
    closeCartDrawer:   (state) => { state.cartDrawerOpen = false; },
    toggleCartDrawer:  (state) => { state.cartDrawerOpen = !state.cartDrawerOpen; },
    openSearchOverlay: (state) => { state.searchOverlayOpen = true; },
    closeSearchOverlay:(state) => { state.searchOverlayOpen = false; },
    toggleSearchOverlay:(state) => { state.searchOverlayOpen = !state.searchOverlayOpen; },
    toggleMobileMenu:  (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu:   (state) => { state.mobileMenuOpen = false; },
  },
});

export const {
  openCartDrawer, closeCartDrawer, toggleCartDrawer,
  openSearchOverlay, closeSearchOverlay, toggleSearchOverlay,
  toggleMobileMenu, closeMobileMenu,
} = uiSlice.actions;

export default uiSlice.reducer;

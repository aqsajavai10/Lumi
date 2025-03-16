import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    value: [],
    appliedPromocode: null,
    promocodeDiscount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, color, size } = action.payload;
      const existingItem = state.value.find(
        (item) => item.product.id === product.id && item.color === color && item.size === size
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.value.push({ product, quantity, color, size });
      }
    },
    removeFromCart: (state, action) => {
      const { product, color, size } = action.payload;
      const existingItem = state.value.find(
        (item) => item.product.id === product.id && item.color === color && item.size === size
      );

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.value = state.value.filter(
            (item) => item.product.id !== product.id || item.color !== color || item.size !== size
          );
        }
      }
    },
    removeAllFromCart: (state, action) => {
      const { product, color, size } = action.payload;
      state.value = state.value.filter(
        (item) => item.product.id !== product.id || item.color !== color || item.size !== size
      );
    },
    clearCart: (state) => {
      state.value = [];
      state.appliedPromocode = null;
      state.promocodeDiscount = 0;
    },
    applyPromocode: (state, action) => {
      const { code, discount } = action.payload;
      state.appliedPromocode = code;
      state.promocodeDiscount = discount;
    },
    removePromocode: (state) => {
      state.appliedPromocode = null;
      state.promocodeDiscount = 0;
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  removeAllFromCart, 
  clearCart,
  applyPromocode,
  removePromocode 
} = cartSlice.actions;

export default cartSlice.reducer;
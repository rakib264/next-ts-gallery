import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode?: string;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  couponCode: undefined,
};

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window !== 'undefined') {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        
        // Clean up invalid items (those with invalid product IDs)
        if (parsed.items && Array.isArray(parsed.items)) {
          const validItems = parsed.items.filter((item: any) => {
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.id);
            if (!isValidObjectId) {
              console.warn('Removing invalid cart item with ID:', item.id);
            }
            return isValidObjectId;
          });
          
          if (validItems.length !== parsed.items.length) {
            parsed.items = validItems;
            // Recalculate totals after cleaning
            const subtotal = validItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
            parsed.total = subtotal + (parsed.shippingCost || 0) + (parsed.tax || 0) - (parsed.discount || 0);
            parsed.itemCount = validItems.reduce((total: number, item: any) => total + item.quantity, 0);
          }
        }
        
        // Always start with the cart closed to avoid SSR/CSR hydration mismatches
        // and ignore any persisted UI-only fields
        return { ...initialState, ...parsed, isOpen: false };
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }
  return initialState;
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    try {
      // Exclude UI-only fields from persistence to avoid restoring open overlays
      const { isOpen, ...persistedState } = state;
      localStorage.setItem('cart', JSON.stringify(persistedState));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // Validate product ID format (24-character hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(action.payload.id);
      if (!isValidObjectId) {
        console.error('Invalid product ID format:', action.payload.id);
        return; // Don't add invalid items to cart
      }
      
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && item.variant === action.payload.variant
      );
      
      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          existingItem.maxQuantity
        );
      } else {
        state.items.push(action.payload);
      }
      
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    removeFromCart: (state, action: PayloadAction<{ id: string; variant?: string }>) => {
      state.items = state.items.filter(item => 
        !(item.id === action.payload.id && item.variant === action.payload.variant)
      );
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; variant?: string; quantity: number }>) => {
      const item = state.items.find(item => 
        item.id === action.payload.id && item.variant === action.payload.variant
      );
      
      if (item) {
        item.quantity = Math.min(Math.max(1, action.payload.quantity), item.maxQuantity);
      }
      
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.shippingCost = 0;
      state.tax = 0;
      state.discount = 0;
      state.couponCode = undefined;
      saveCartToStorage(state);
    },
    
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    applyCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.couponCode = action.payload.code;
      state.discount = action.payload.discount;
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    removeCoupon: (state) => {
      state.couponCode = undefined;
      state.discount = 0;
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToStorage(state);
    },
    
    calculateTotals: (state) => {
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.tax = Math.round(subtotal * 0.00); // 0% tax
      state.total = subtotal + state.shippingCost + state.tax - state.discount;
    },
    
    reloadCartFromStorage: (state) => {
      const loaded = loadCartFromStorage();
      Object.assign(state, loaded);
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  toggleCart,
  setShippingCost,
  applyCoupon,
  removeCoupon,
  calculateTotals,
  reloadCartFromStorage
} = cartSlice.actions;

export default cartSlice.reducer;
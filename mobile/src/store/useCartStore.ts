import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: (itemId: string) => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,

  addItem: (item) => {
    const state = get();
    
    // Check if cart is from different restaurant
    if (state.restaurantId && state.restaurantId !== item.restaurantId) {
      // Clear cart if switching restaurants
      set({
        items: [],
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      });
    } else if (!state.restaurantId) {
      set({
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      });
    }

    const existingItem = state.items.find((i) => i.id === item.id);

    if (existingItem) {
      set({
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({
        items: [
          ...state.items,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          },
        ],
      });
    }
  },

  removeItem: (itemId) => {
    const state = get();
    const newItems = state.items.filter((i) => i.id !== itemId);
    
    if (newItems.length === 0) {
      set({ items: [], restaurantId: null, restaurantName: null });
    } else {
      set({ items: newItems });
    }
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
    } else {
      set({
        items: get().items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      });
    }
  },

  clearCart: () => {
    set({ items: [], restaurantId: null, restaurantName: null });
  },

  getItemCount: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
  },
}));


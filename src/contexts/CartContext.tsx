import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../lib/supabase';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>; // ex: { "Tamanho": "M", "Cor": "Azul" }
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: Record<string, string>) => void;
  removeFromCart: (productId: string, options?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, options?: Record<string, string>) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartTotal: 0,
  cartCount: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lojify-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('lojify-cart', JSON.stringify(items));
  }, [items]);

  // Helper para comparar opções
  const areOptionsEqual = (opts1?: Record<string, string>, opts2?: Record<string, string>) => {
    if (!opts1 && !opts2) return true;
    if (!opts1 || !opts2) return false;
    
    const keys1 = Object.keys(opts1);
    const keys2 = Object.keys(opts2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (opts1[key] !== opts2[key]) return false;
    }
    
    return true;
  };

  const addToCart = (product: Product, quantity = 1, options?: Record<string, string>) => {
    setItems((prev) => {
      // Procura se já existe o mesmo produto com as MESMAS opções
      const existingIndex = prev.findIndex((item) => 
        item.product.id === product.id && areOptionsEqual(item.selectedOptions, options)
      );

      if (existingIndex >= 0) {
        // Atualiza quantidade
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }
      
      // Adiciona novo item
      return [...prev, { product, quantity, selectedOptions: options }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, options?: Record<string, string>) => {
    setItems((prev) => prev.filter((item) => 
      !(item.product.id === productId && areOptionsEqual(item.selectedOptions, options))
    ));
  };

  const updateQuantity = (productId: string, quantity: number, options?: Record<string, string>) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        (item.product.id === productId && areOptionsEqual(item.selectedOptions, options))
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export const getCart = () => {
  try {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (err) {
    console.error('Cart save error:', err);
  }
};

export const addToCart = (product) => {
  const cart = getCart();
  const index = cart.findIndex((item) => item._id === product._id);

  if (index >= 0) {
    cart[index].quantity += 1;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images || [],
      quantity: 1
    });
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item._id !== productId);
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartCount = () => {
  return getCart().reduce((sum, item) => sum + (item.quantity || 0), 0);
};

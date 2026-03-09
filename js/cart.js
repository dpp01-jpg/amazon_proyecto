let cart = [];

// Esta es la única función que exportamos para main.js
// Ahora recibe el "game" completo, ¡ya no necesita buscar en localdata!
export function addToCartLogic(card) {
  
  // 1. Buscamos si ya está en la cesta (¡Ojo! es cart.find, no card.find)
  const existingItem = cart.find((item) => item.id === card.id);
  const currentQty = existingItem ? existingItem.quantity : 0;

  // 2. Validar stock (Usamos game.stock)
  if (currentQty + 1 > card.stock) {
    alert("No hay suficiente stock disponible para este producto.");
    return;
  }

  // 3. Añadir o sumar
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: card.id,
      title: card.title,
      price: card.price, // Si falla el precio, asegúrate de que tu JSON tiene "price"
      quantity: 1,
    });
  }
  
  saveCart(); 
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  updateCart();
}

function saveCart() {
  localStorage.setItem("shoppingCart", JSON.stringify(cart));
}

function updateCart() {
    const badge = document.getElementById("cart-count");
    if (badge) {
        // En lugar de cart.length (que cuenta juegos únicos),
        // reduce() sumará la cantidad total de artículos. ¡Pruébalo!
        badge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function loadCart() {
  const savedCart = localStorage.getItem("shoppingCart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCart();
    } catch (e) {
      console.error("Error parseando el carrito", e);
      cart = [];
    }
  }
}

// Cargamos el carrito al iniciar este archivo
loadCart();

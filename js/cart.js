/**
 * Lógica global del carrito sincronizada con la base de datos.
 */

// Esta es la función principal que se usa desde el grid de productos y la página de producto
export async function addToCartLogic(card, quantity) {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    alert("🛒 Debes identificarte para añadir productos a tu carrito.");
    // Redirigir a login
    window.location.href = "../registro/login.html";
    return;
  }

  const user = JSON.parse(savedUser);

  try {
    // 1. Añadir al carrito en la base de datos
    console.log(quantity)
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_producto: card.id,
        cantidad: quantity
      })
    });

    if (res.ok) {
      console.log("Producto añadido a la BD");
      // 2. Actualizar el contador visual (badge)
      updateCart();

      // Opcional: Feedback visual de que se añadió
      const btn = document.querySelector(`button[onclick="addCart(${card.id})"]`);
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = "✅ Añadido";
        btn.style.backgroundColor = "#7cfc00";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = "";
        }, 2000);
      }
    } else {
      const err = await res.json();
      alert("Error al añadir al carrito: " + (err.error || "Error desconocido"));
    }
  } catch (e) {
    console.error("Error de conexión al añadir al carrito", e);
  }
}

// Función para actualizar el contador del carrito en el header
export async function updateCart() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const savedUser = localStorage.getItem("user");
  if (!savedUser) {
    badge.textContent = "0";
    return;
  }

  try {
    const user = JSON.parse(savedUser);
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (res.ok) {
      const cartItems = await res.json();
      const totalQty = cartItems.reduce((total, item) => total + item.quantity, 0);
      badge.textContent = totalQty;
    }
  } catch (e) {
    console.error("Error al actualizar el contador del carrito", e);
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  updateCart();
});

// Exponer globalmente para que otros scripts no modulares puedan usarlo
window.updateCartBadge = updateCart;
window.addToCart = addToCartLogic;

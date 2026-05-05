/**
 * Lógica para mostrar y gestionar los productos en la página del carrito,
 * sincronizada con la base de datos de Amazon Clone.
 */

async function renderCart() {
    const savedUser = localStorage.getItem("user");
    const container = document.getElementById("cart-items-container");
    const emptyState = document.getElementById("empty-cart-state");
    const cartBoxLayout = document.querySelector(".cart-left-column .cart-box:not(.empty-state)");
    const rightColumn = document.querySelector(".cart-right-column");

    // 1. Verificar si el usuario está logueado
    if (!savedUser) {
        if (container) container.innerHTML = "";
        if (cartBoxLayout) cartBoxLayout.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "block";
            const emptyText = emptyState.querySelector(".empty-cart-text h2");
            if (emptyText) emptyText.textContent = "Inicia sesión para ver tu carrito";
            const emptyBtn = emptyState.querySelector(".btn-amazon-primary");
            if (emptyBtn) {
                emptyBtn.textContent = "Identificarse";
                emptyBtn.href = "../registro/login.html";
            }
        }
        if (rightColumn) rightColumn.style.display = "none";
        return;
    }

    const user = JSON.parse(savedUser);

    try {
        // 2. Obtener productos del carrito desde la base de datos
        const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
        if (!res.ok) throw new Error("Error al comunicarse con el servidor");
        const cart = await res.json();

        // 3. Manejar estado vacío
        if (cart.length === 0) {
            if (container) container.innerHTML = "";
            if (cartBoxLayout) cartBoxLayout.style.display = "none";
            if (emptyState) {
                emptyState.style.display = "block";
                const emptyText = emptyState.querySelector(".empty-cart-text h2");
                if (emptyText) emptyText.textContent = "Tu carrito de Amazon está vacío";
            }
            if (rightColumn) rightColumn.style.display = "none";
            return;
        }

        // 4. Mostrar layout de carrito
        if (emptyState) emptyState.style.display = "none";
        if (cartBoxLayout) cartBoxLayout.style.display = "block";
        if (rightColumn) rightColumn.style.display = "block";

        let html = "";
        let totalItems = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            const qty = Number(item.quantity);
            const basePrice = parseFloat(item.price);
            let itemPrice = basePrice;

            let promoHtml = "";
            if (item.promo_percent) {
                itemPrice = basePrice * (1 - (item.promo_percent / 100));
                promoHtml = `
                    <div class="cart-promo-info" style="color: #CC0C39; font-size: 13px; font-weight: bold; margin-top: 5px;">
                        -${item.promo_percent}% ${item.promo_text || ''}
                        <span style="text-decoration: line-through; color: #565959; font-weight: normal; margin-left: 5px;">${basePrice.toFixed(2)} €</span>
                    </div>
                `;
            }

            totalItems += qty;
            totalPrice += itemPrice * qty;

            // Ajustar ruta de imagen para visualización en /carrito/
            let imgPath = item.image || "";
            if (!imgPath.startsWith("http") && !imgPath.startsWith("data:") && !imgPath.startsWith("../") && !imgPath.startsWith("/")) {
                imgPath = "../" + imgPath;
            } else if (imgPath.startsWith("/amazon_proyecto/")) {
                imgPath = imgPath.replace("/amazon_proyecto/", "../");
            }

            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image-container">
                        <img src="${imgPath}" alt="${item.title}" class="cart-item-image">
                    </div>
                    <div class="cart-item-details">
                        <a href="../producto/product.html?id=${item.id}" class="cart-item-title">${item.title}</a>
                        ${promoHtml}
                        <div class="cart-item-stock">En stock</div>
                        <div class="cart-item-actions">
                            <select onchange="changeQuantity(${item.id}, this.value)">
                                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${n === Number(item.quantity) ? 'selected' : ''}>${n}</option>`).join('')}
                            </select>
                            <span class="action-divider">|</span>
                            <button class="action-link" onclick="removeItem(${item.id})">Eliminar</button>
                            <span class="action-divider">|</span>
                            <button class="action-link">Guardar para más tarde</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        ${parseFloat(itemPrice).toFixed(2).replace('.', ',')} €
                    </div>
                </div>
            `;
        });

        if (container) container.innerHTML = html;

        // 5. Actualizar subtotales
        const subtotalText = `Subtotal (${totalItems} productos): <strong>${totalPrice.toFixed(2).replace('.', ',')} €</strong>`;
        const bottomSubtotal = document.getElementById("cart-subtotal-bottom");
        const summarySubtotal = document.getElementById("cart-summary-subtotal");

        if (bottomSubtotal) bottomSubtotal.innerHTML = subtotalText;
        if (summarySubtotal) summarySubtotal.innerHTML = subtotalText;

        // Sincronizar badge del header
        if (typeof window.updateCartBadge === 'function') {
            window.updateCartBadge();
        }

    } catch (err) {
        console.error("Error renderizando carrito:", err);
        if (container) container.innerHTML = "<p>Error al cargar el carrito. Inténtalo de nuevo más tarde.</p>";
    }
}

/**
 * Cambiar la cantidad de un producto en la base de datos
 */
window.changeQuantity = async function (productId, newQty) {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;
    const user = JSON.parse(savedUser);

    try {
        const res = await fetch(`http://localhost:3000/api/cart/${user.id}/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: parseInt(newQty) })
        });
        if (res.ok) {
            renderCart();
        } else {
            alert("No se pudo actualizar la cantidad.");
        }
    } catch (err) {
        console.error("Error al cambiar cantidad:", err);
    }
}

/**
 * Eliminar un producto del carrito en la base de datos
 */
window.removeItem = async function (productId) {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;
    const user = JSON.parse(savedUser);

    try {
        const res = await fetch(`http://localhost:3000/api/cart/${user.id}/${productId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            renderCart();
        } else {
            alert("No se pudo eliminar el producto.");
        }
    } catch (err) {
        console.error("Error al eliminar item:", err);
    }
}

// Iniciar renderizado al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

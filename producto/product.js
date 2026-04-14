document.addEventListener("DOMContentLoaded", async () => {
    // Check if there is an ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.getElementById('prod-title').textContent = "Producto no encontrado (Falta ID)";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);

        if (!response.ok) {
            document.getElementById('prod-title').textContent = "Producto no encontrado";
            return;
        }

        const product = await response.json();

        // Corregir la ruta de la imagen si viene con la ruta absoluta mapeada mal desde la DB
        console.log(product);
        let imagePath = product.image;
        if (imagePath.startsWith('/amazon_proyecto/')) {
            imagePath = imagePath.replace('/amazon_proyecto/', '../');
        }

        // Rellenar la información básica en la plantilla
        document.getElementById('prod-title').textContent = product.title;
        document.getElementById('prod-image').src = imagePath;

        // ====== Lógica de Precios y Descuentos (NUEVO/ACTUALIZADO) ======
        const basePrice = parseFloat(product.price);
        let finalPrice = basePrice;
        
        if (product.promo_percent) {
            finalPrice = basePrice * (1 - (product.promo_percent / 100));
            
            // Mostrar elementos de descuento
            const badge = document.getElementById('prod-promo-badge');
            const originalPriceEl = document.getElementById('prod-original-price');
            const originalPriceAsideEl = document.getElementById('prod-original-price-aside');
            
            if (badge) {
                badge.textContent = `-${product.promo_percent}%`;
                badge.style.display = 'inline-block';
            }
            if (originalPriceEl) {
                originalPriceEl.textContent = `Precio recomendado: ${basePrice.toFixed(2)} €`;
                originalPriceEl.style.display = 'block';
            }
            if (originalPriceAsideEl) {
                originalPriceAsideEl.textContent = `${basePrice.toFixed(2)} €`;
                originalPriceAsideEl.style.display = 'inline-block';
            }
        }

        // Rellenar los precios finales
        const priceMain = document.getElementById('prod-price-main');
        const priceAside = document.getElementById('prod-price-aside');
        
        if (priceMain) priceMain.textContent = finalPrice.toFixed(2);
        if (priceAside) priceAside.textContent = finalPrice.toFixed(2) + " €";

        // Actualizamos el objeto product para que addToCart use el precio rebajado si lo requiere, 
        // aunque el backend suele ser la fuente de verdad, esto ayuda al feedback visual.
        product.final_price = finalPrice;


        if (product.description && product.description !== 'null') {
            document.getElementById('prod-desc').innerHTML = `
                <h2>Acerca de este producto</h2>
                <p>${product.description}</p>
            `;
        } else {
            document.getElementById('prod-desc').innerHTML = `
                <h2>Acerca de este producto</h2>
                <p>No hay descripción disponible para este producto.</p>
            `;
        }

        // ====== Renderizar Detalles Técnicos (NUEVO) ======
        const detailsContainer = document.getElementById('prod-details');
        if (product.detalles && product.detalles !== 'null' && product.detalles.trim() !== '') {
            let detailsHTML = '';
            // Dividir el texto del campo detalles por salto de línea
            const lineas = product.detalles.split('\\n');
            lineas.forEach(linea => {
                if (linea.trim() === '') return;

                // Si la línea dice "Marca: Sony", partir en Clave/Valor
                const separador = linea.indexOf(':');
                if (separador !== -1) {
                    const clave = linea.substring(0, separador).trim();
                    const valor = linea.substring(separador + 1).trim();
                    detailsHTML += `<p><strong>${clave}:</strong> ${valor}</p>`;
                } else {
                    // Si no tiene 2 puntos, pintar normal
                    detailsHTML += `<p>${linea}</p>`;
                }
            });
            detailsContainer.innerHTML = detailsHTML;
        }

        // Iterar sobre las miniaturas y ponerles la misma imagen
        const miniaturas = document.querySelectorAll('.miniaturas img');
        miniaturas.forEach(img => {
            img.src = imagePath;
        });

        // Poner también el título en la parte del navegador (opcional)
        document.title = product.title + " - Amazon Clone";

        // ====== Lógica de Añadir al Carrito (NUEVO) ======
        const addBtn = document.querySelector(".boton-carrito");
        if (addBtn) {
            addBtn.onclick = () => {
                if (typeof window.addToCart === 'function') {
                    const selectEl = document.getElementById("cantidad");
                    const cantidadSeleccionada = selectEl ? parseInt(selectEl.value, 10) : 1;
                    
                    console.log("Añadiendo al carrito - ID:", product.id, "Cantidad:", cantidadSeleccionada);
                    window.addToCart(product, cantidadSeleccionada);
                } else {
                    console.error("Error: Lógica del carrito no disponible.");
                }
            };
        }

        // ====== Lógica de Comprar Ya (NUEVO) ======
        const buyBtn = document.querySelector(".boton-comprar");
        if (buyBtn) {
            buyBtn.onclick = async () => {
                if (typeof window.addToCart === 'function') {
                    const selectEl = document.getElementById("cantidad");
                    const cantidadSeleccionada = selectEl ? parseInt(selectEl.value, 10) : 1;
                    
                    console.log("Comprando ya - ID:", product.id, "Cantidad:", cantidadSeleccionada);
                    // Añadimos y redirigimos
                    await window.addToCart(product, cantidadSeleccionada);
                    window.location.href = "../carrito/index.html";
                } else {
                    console.error("Error: Lógica del carrito no disponible.");
                }
            };
        }

    } catch (err) {
        console.error("Error al cargar producto:", err);
        document.getElementById('prod-title').textContent = "Error de conexión";
    }
});

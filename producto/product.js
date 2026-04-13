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

        // Rellenar la información en la plantilla
        document.getElementById('prod-title').textContent = product.title;
        document.getElementById('prod-image').src = imagePath;
        document.getElementById('prod-price-main').textContent = product.price;
        document.getElementById('prod-price-aside').textContent = product.price + " €";

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
                if(linea.trim() === '') return;
                
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

    } catch (err) {
        console.error("Error al cargar producto:", err);
        document.getElementById('prod-title').textContent = "Error de conexión";
    }
});

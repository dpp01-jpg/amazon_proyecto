document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');

    const titleEl = document.getElementById('category-title');
    const countEl = document.getElementById('category-count');
    const gridEl = document.getElementById('products-grid');
    const filterForm = document.getElementById('filter-form');
    const resetBtn = document.getElementById('reset-filters');

    if (!categoryId) {
        titleEl.textContent = 'Categoría no encontrada';
        countEl.textContent = 'Por favor, selecciona una categoría válida.';
        return;
    }

    // Cargar nombre de la categoría y menú de navegación
    try {
        const resCats = await fetch('http://localhost:3000/api/categories');
        if (resCats.ok) {
            const categories = await resCats.json();
            
            // Poblar menú de navegación superior
            const navUl = document.getElementById('dynamic-category-nav');
            if (navUl) {
                categories.forEach(cat => {
                    const isCurrent = cat.id == categoryId;
                    const li = document.createElement('li');
                    li.className = 'nav-hover';
                    
                    const a = document.createElement('a');
                    a.href = `?id=${cat.id}`;
                    a.textContent = cat.nombre;
                    a.style.color = 'white';
                    a.style.textDecoration = 'none';
                    a.style.fontSize = '14px';
                    
                    if (isCurrent) {
                        a.style.fontWeight = 'bold';
                        a.style.borderBottom = '2px solid #f0c14b';
                        a.style.paddingBottom = '2px';
                    }
                    
                    li.appendChild(a);
                    navUl.appendChild(li);
                });
            }

            // Establecer el título
            const category = categories.find(c => c.id == categoryId);
            if (category) {
                titleEl.textContent = category.nombre;
                document.title = `${category.nombre} - Amazon Clone`;
            } else {
                titleEl.textContent = 'Categoría Desconocida';
            }
        }
    } catch (err) {
        console.error("Error al cargar categorías:", err);
    }

    // Función para cargar productos con filtros
    const loadProducts = async () => {
        gridEl.innerHTML = '<p>Cargando productos...</p>';
        countEl.textContent = 'Buscando productos...';

        const name = document.getElementById('filter-name').value;
        const minPrice = document.getElementById('filter-min-price').value;
        const maxPrice = document.getElementById('filter-max-price').value;

        let url = `http://localhost:3000/api/products?category=${categoryId}`;
        if (name) url += `&search=${encodeURIComponent(name)}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error en la respuesta de la API");
            
            const data = await res.json();
            const products = data.data || data; // Depende de si hay paginación o no

            countEl.textContent = `Encontrados ${products.length} productos.`;

            if (products.length === 0) {
                gridEl.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No se encontraron productos con estos filtros.</p>';
                return;
            }

            let html = '';
            products.forEach(p => {
                // Cálculo de precios
                const basePrice = parseFloat(p.price);
                let finalPrice = basePrice;
                let priceHtml = `<p style="font-size: 21px; font-weight: bold; margin: 0;">${basePrice.toFixed(2)} €</p>`;

                if (p.promo_percent) {
                    finalPrice = basePrice * (1 - (p.promo_percent / 100));
                    priceHtml = `
                        <p style="text-decoration: line-through; color: #565959; font-size: 14px; margin: 0;">${basePrice.toFixed(2)} €</p>
                        <p style="font-size: 21px; font-weight: bold; margin: 0; color: #B12704;">${finalPrice.toFixed(2)} €</p>
                    `;
                }

                const promoHtml = p.promo_percent 
                    ? `<div style="background:#cc0c39; color:white; padding:2px 5px; font-size:12px; font-weight:bold; border-radius:2px; display:inline-block; margin-bottom:5px;">-${p.promo_percent}% Oferta</div>`
                    : '';

                // CORRECCIÓN: Detectar si la imagen es una URL externa o local
                let imagePath = p.image;
                if (!imagePath.startsWith('http')) {
                    imagePath = `../${imagePath.replace(/^\/?/, '')}`;
                }

                html += `
                    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; display: flex; flex-direction: column; background: white;">
                        <a href="../producto/product.html?id=${p.id}" style="text-align: center; height: 180px; display:flex; align-items:center; justify-content:center; text-decoration:none;">
                            <img src="${imagePath}" alt="${p.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        </a>
                        <div style="margin-top: 15px; flex-grow: 1;">
                            ${promoHtml}
                            <a href="../producto/product.html?id=${p.id}" style="text-decoration: none; color: #007185; font-size: 16px; display:block; margin-bottom: 5px;">
                                ${p.title}
                            </a>
                            ${priceHtml}
                        </div>
                    </div>
                `;
            });

            gridEl.innerHTML = html;

        } catch (err) {
            console.error("Error cargando productos:", err);
            gridEl.innerHTML = '<p style="color:red;">Error al cargar los productos.</p>';
        }
    };

    // Filtros submit
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loadProducts();
    });

    // Limpiar filtros
    resetBtn.addEventListener('click', () => {
        filterForm.reset();
        loadProducts();
    });

    // Carga inicial
    loadProducts();
});

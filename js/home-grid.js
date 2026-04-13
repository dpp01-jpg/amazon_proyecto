document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    try {
        const response = await fetch('http://localhost:3000/api/home-grid');
        if (!response.ok) throw new Error("Fallo al conectar con la API");
        const categories = await response.json();

        // Bloque de Login (Fijo en 4ª posición)
        const loginCard = `
            <div class="columna-login">
                <div class="cuadro-login">
                    <h3>Identifícate para una mejor experiencia</h3>
                    <a href="./registro/login.html" class="boton-login-falso">
                        Inicia sesión de manera segura
                    </a>
                </div>
                <div class="bloque-publicidad">
                    <a href="#" class="caja-anuncio-azul">
                        <img src="imagenes/img/imagen_11.jpg" alt="Prime Video">
                    </a>
                </div>
            </div>
        `;

        let htmlContent = "";
        let loginInyectado = false;

        if (categories.length === 0) {
            grid.innerHTML = loginCard;
            return;
        }

        categories.forEach((cat, index) => {
            // Inyectar login en la 4ª posición (índice 3)
            if (index === 3) {
                htmlContent += loginCard;
                loginInyectado = true;
            }

            let categoryHtml = "";
            const linkText = cat.link_text || "Ver más";

            if (cat.layout_type === 'grid4') {
                categoryHtml = `
                    <div class="cuadro-alumno">
                        <h3>${cat.nombre}</h3>
                        <div class="rejilla-4">
                            ${cat.products.map(p => {
                                // Lógica de promociones: si tiene promo_percent, mostramos el badge rojo
                                const promoSpan = p.promo_percent 
                                    ? `<span>-${p.promo_percent}% ${p.promo_text || ''}</span>` 
                                    : "";
                                
                                return `
                                    <a href="./producto/product.html?id=${p.id}" class="mini-cuadro">
                                        <img src="${p.image}" alt="${p.title}">
                                        ${promoSpan}
                                    </a>
                                `;
                            }).join('')}
                        </div>
                        <a href="categorias.html?id=${cat.id}" class="enlace-cuadro">${linkText}</a>
                    </div>
                `;
            } else if (cat.layout_type === 'grid2') {
                categoryHtml = `
                    <div class="cuadro-alumno">
                        <h3>${cat.nombre}</h3>
                        <div class="rejilla-2">
                            ${cat.products.map(p => `
                                <a href="./producto/product.html?id=${p.id}" class="imagen-grande-cuadro">
                                    <img src="${p.image}" alt="${p.title}">
                                </a>
                            `).join('')}
                        </div>
                        <a href="categorias.html?id=${cat.id}" class="enlace-cuadro">${linkText}</a>
                    </div>
                `;
            } else {
                // Layout Single
                categoryHtml = `
                    <div class="cuadro-alumno">
                        <h3>${cat.nombre}</h3>
                        <a href="categorias.html?id=${cat.id}" class="imagen-una-sola">
                            <img src="${cat.products[0]?.image || ''}" alt="${cat.nombre}">
                        </a>
                        <a href="categorias.html?id=${cat.id}" class="enlace-cuadro">${linkText}</a>
                    </div>
                `;
            }
            htmlContent += categoryHtml;
        });

        // Asegurar que el login se inyecta incluso si hay menos de 4 categorías
        if (!loginInyectado) {
            htmlContent += loginCard;
        }

        grid.innerHTML = htmlContent;

    } catch (err) {
        console.error("Error cargando el grid dinámico:", err);
        grid.innerHTML = `<p style="padding:20px;">Error al cargar productos dinámicos.</p>`;
    }
});

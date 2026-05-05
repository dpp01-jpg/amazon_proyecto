import { addToCartLogic } from "./cart.js";

// === PATRULLA DE SEGURIDAD GLOBAL (COMPROBAR BANEOS) ===
(async function checkSessionStatus() {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    try {
        const user = JSON.parse(userData);
        const res = await fetch(`http://localhost:3000/api/users/${user.email}/status`);
        if (res.ok) {
            const status = await res.json();
            if (status.isBanned) {
                alert(`Haz sido expulsado de Amazon Clone.\nMotivo: ${status.reason || 'Sin motivo'}\nTu baneo termina el: ${new Date(status.until).toLocaleString()}`);
                localStorage.removeItem('user');
                window.location.href = '/amazon_proyecto/index.html'; 
            }
        }
    } catch(err) {
        console.error('Error interno comprobando baneos:', err);
    }
})();
// ===============================================

const zonaDatos = document.querySelector("#zona-datos-js");

let localdata = [];

window.addCart = function(id) {
    const cardSelected = localdata.find((g) => g.id === id);
    if (cardSelected) {
        addToCartLogic(cardSelected);
    }
};

// ====== Control de Modo: Inicio vs Resultados de Búsqueda ======
const mainGridContainer = document.querySelector(".content-grid");
const heroSection = document.querySelector(".hero-section");

function enterSearchMode() {
    // Ocultar la home (categorías + carrusel) completo
    if (mainGridContainer) mainGridContainer.style.display = "none";
    if (heroSection) heroSection.style.display = "none";
    // Mostrar la zona de resultados
    if (zonaDatos) zonaDatos.style.display = "block";
}

function exitSearchMode() {
    // Volver a mostrar la home
    if (mainGridContainer) mainGridContainer.style.display = "grid";
    if (heroSection) heroSection.style.display = "";
    // Ocultar zona de resultados y limpiarla
    if (zonaDatos) { zonaDatos.style.display = "none"; zonaDatos.innerHTML = ""; }
    // Limpiar contadores y paginación
    const counter = document.getElementById("search-result-counter");
    if (counter) counter.style.display = "none";
    const pagContainer = document.getElementById("pagination-container");
    if (pagContainer) pagContainer.innerHTML = "";
}

const searchInput = document.querySelector(".search-container input");
const searchBtn = document.querySelector(".search-btn");

let currentPage = 1;
const limit = 4;
let currentSearch = "";

// ====== Resultado counter ======
function showResultCounter(total, term) {
    let counter = document.getElementById("search-result-counter");
    if (!counter) {
        counter = document.createElement("p");
        counter.id = "search-result-counter";
        counter.style.cssText = "padding: 10px 20px; font-size: 14px; color: #565959; background: white; border-bottom: 1px solid #ddd;";
        const main = document.querySelector("main") || document.body;
        main.insertBefore(counter, main.firstChild);
    }
    if (term) {
        counter.textContent = `Mostrando ${total} resultado${total !== 1 ? 's' : ''} para "${term}"`;
        counter.style.display = "block";
    } else {
        counter.style.display = "none";
    }
}

// ====== Autocompletado ======
let debounceTimer = null;
let suggestionsBox = null;

function getSuggestionsBox() {
    if (!suggestionsBox) {
        suggestionsBox = document.createElement("div");
        suggestionsBox.id = "search-suggestions";
        document.querySelector(".search-container").appendChild(suggestionsBox);
    }
    return suggestionsBox;
}

function hideSuggestions() {
    const box = document.getElementById("search-suggestions");
    if (box) box.style.display = "none";
}

async function fetchSuggestions(query) {
    if (!query || query.trim().length < 1) { hideSuggestions(); return; }
    try {
        const res = await fetch(`http://localhost:3000/api/products/suggestions?q=${encodeURIComponent(query)}`);
        const items = await res.json();
        renderSuggestions(items, query);
    } catch (e) {
        hideSuggestions();
    }
}

function renderSuggestions(items, query) {
    const box = getSuggestionsBox();
    if (!items || items.length === 0) { box.style.display = "none"; return; }

    box.innerHTML = "";
    items.forEach(item => {
        let imagePath = item.image || "";
        if (imagePath.startsWith('/amazon_proyecto/')) {
            imagePath = imagePath.replace('/amazon_proyecto/', './');
        }

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = `
            <img src="${imagePath}" alt="${item.title}">
            <div class="suggestion-info">
                <span class="suggestion-title">${item.title}</span>
                <span class="suggestion-price">${parseFloat(item.price).toFixed(2)} €</span>
            </div>
        `;
        div.addEventListener("click", () => {
            window.location.href = `./producto/product.html?id=${item.id}`;
        });
        box.appendChild(div);
    });

    // Enlace "ver todos los resultados"
    const seeAll = document.createElement("div");
    seeAll.className = "suggestion-see-all";
    seeAll.textContent = `Ver todos los resultados para "${query}"`;
    seeAll.addEventListener("click", () => {
        hideSuggestions();
        currentSearch = query;
        if (searchInput) searchInput.value = query;
        currentPage = 1;
        init();
    });
    box.appendChild(seeAll);
    box.style.display = "block";
}

async function getData(page = 1, search = "") {
    try {
        let url = `http://localhost:3000/api/products?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error cargando los datos");
        }

        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        if (zonaDatos) {
            zonaDatos.innerHTML = "<p>Error cargando los productos.</p>";
        }
    }
}

function renderCards(data) {
    if (!zonaDatos) return;

    zonaDatos.innerHTML = "";

    if (!data || data.length === 0) {
        zonaDatos.innerHTML = `
            <div class="search-empty">
                <p>😕 No se encontraron productos para tu búsqueda.</p>
                <p>Intenta con otras palabras clave.</p>
            </div>`;
        return;
    }

    const grid = document.createElement("div");
    grid.className = "search-results-grid";

    data.forEach((item) => {
        let imagePath = item.image || "";
        if (imagePath.startsWith('/amazon_proyecto/')) {
            imagePath = imagePath.replace('/amazon_proyecto/', './');
        }

        // Calcular precio con descuento
        const basePrice = parseFloat(item.price);
        let finalPrice = basePrice;
        let promoHtml = "";
        if (item.promo_percent) {
            finalPrice = basePrice * (1 - item.promo_percent / 100);
            promoHtml = `<span class="search-card-badge">-${item.promo_percent}%</span>`;
        }

        const card = document.createElement("div");
        card.className = "search-result-card";
        card.innerHTML = `
            <a href="./producto/product.html?id=${item.id}" class="search-card-img-link">
                <img src="${imagePath}" alt="${item.title}" class="search-card-img">
            </a>
            <div class="search-card-body">
                <a href="./producto/product.html?id=${item.id}" class="search-card-title">${item.title}</a>
                <div class="search-card-price-row">
                    ${promoHtml}
                    <span class="search-card-price">${finalPrice.toFixed(2)} €</span>
                    ${item.promo_percent ? `<span class="search-card-original">${basePrice.toFixed(2)} €</span>` : ""}
                </div>
                <button class="search-card-btn" onclick="addCart(${item.id})">
                    🛒 Añadir al carrito
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    zonaDatos.appendChild(grid);
}

function renderPagination(total) {
    let pagContainer = document.querySelector("#pagination-container");
    if (!pagContainer) {
        pagContainer = document.createElement("div");
        pagContainer.id = "pagination-container";
        pagContainer.style.textAlign = "center";
        pagContainer.style.marginTop = "20px";
        pagContainer.style.paddingBottom = "20px";
        zonaDatos.insertAdjacentElement("afterend", pagContainer);
    }

    const totalPages = Math.ceil(total / limit);
    pagContainer.innerHTML = "";

    if (totalPages > 1) {
        if (currentPage > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.textContent = "Anterior";
            prevBtn.style.marginRight = "10px";
            prevBtn.onclick = () => { currentPage--; init(); };
            pagContainer.appendChild(prevBtn);
        }

        const info = document.createElement("span");
        info.innerHTML = ` Página ${currentPage} de ${totalPages} `;
        pagContainer.appendChild(info);

        if (currentPage < totalPages) {
            const nextBtn = document.createElement("button");
            nextBtn.textContent = "Siguiente";
            nextBtn.style.marginLeft = "10px";
            nextBtn.onclick = () => { currentPage++; init(); };
            pagContainer.appendChild(nextBtn);
        }
    }
}

async function init() {
    if (currentSearch) {
        enterSearchMode();
    } else {
        exitSearchMode();
        return; // No hacer fetch si no hay búsqueda
    }

    const result = await getData(currentPage, currentSearch);

    if (result && result.data) {
        localdata = result.data;
        renderCards(result.data);
        renderPagination(result.total);
        showResultCounter(result.total, currentSearch);
    }
}

// ====== Eventos del buscador ======
if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
        hideSuggestions();
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        init();
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            hideSuggestions();
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            init();
        }
    });

    // Cuando el usuario borra el texto: volver a la home
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const q = searchInput.value.trim();
        if (q.length === 0) {
            hideSuggestions();
            currentSearch = "";
            currentPage = 1;
            exitSearchMode();
            return;
        }
        debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            hideSuggestions();
        }
    });
}

// ====== Detectar búsqueda desde URL (?search=...) ======
const urlParams = new URLSearchParams(window.location.search);
const searchFromUrl = urlParams.get("search");
if (searchFromUrl && searchInput) {
    currentSearch = searchFromUrl;
    searchInput.value = searchFromUrl;
    init(); // Ejecutar búsqueda desde URL
} else {
    // Sin búsqueda: mostrar home por defecto (home-grid.js se encarga del #main-grid)
    exitSearchMode();
}

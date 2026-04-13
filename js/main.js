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

const searchInput = document.querySelector(".search-container input");
const searchBtn = document.querySelector(".search-btn");

let currentPage = 1;
const limit = 4;
let currentSearch = "";

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
        zonaDatos.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
    }

    data.forEach((item) => {
        const div = document.createElement("div");
        div.className = "card";

        let imagePath = item.image;
        if (imagePath.startsWith('/amazon_proyecto/')) {
            imagePath = imagePath.replace('/amazon_proyecto/', './');
        }

        div.innerHTML = `
            <h3>${item.title}</h3>
            <div class="placeholder-img" style="text-align: center; margin-bottom: 10px;">
                <img src="${imagePath}" alt="${item.title}" style="max-width: 100%; height: auto;">
            </div>
            <p style="font-weight: bold; text-align: center;">${item.price} €</p>
            <div style="text-align: center; margin-top: 10px;">
              <a href="./producto/product.html?id=${item.id}">Ver más</a>
            </div>
            <button class="add-cart-btn" onclick="addCart(${item.id})">
                Añadir al carrito
            </button>
        `;

        zonaDatos.appendChild(div);
    });
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
    const result = await getData(currentPage, currentSearch);

    if (result && result.data) {
        localdata = result.data;
        renderCards(result.data);
        renderPagination(result.total);
    }
}

if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
        currentSearch = searchInput.value;
        currentPage = 1;
        init();
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            currentSearch = searchInput.value;
            currentPage = 1;
            init();
        }
    });
}

init();
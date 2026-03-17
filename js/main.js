import { addToCartLogic } from "./cart.js";

const zonaDatos = document.querySelector("#zona-datos-js");

let localdata = [];

window.addCart = function(id) {
    const cardSelected = localdata.find((g) => g.id === id);
    if (cardSelected) {
        addToCartLogic(cardSelected);
    }
};

async function getData() {
    try {
        const response = await fetch("./data/main-data.json");

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

    data.forEach((item) => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${item.title}</h3>
            <div class="placeholder-img">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <a href="#">Ver más</a>
            <button class="add-cart-btn" onclick="addCart(${item.id})">
                Añadir al carrito
            </button>
        `;

        zonaDatos.appendChild(div);
    });
}

async function init() {
    const data = await getData();

    if (data) {
        localdata = data;
        renderCards(data);
    }
}

init();
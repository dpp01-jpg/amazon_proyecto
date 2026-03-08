// 1. Referencia a los elementos del DOM corregida
const contentGrid = document.querySelector(".content-grid");
import { addToCartLogic } from './cart.js';
//Aqui hago publica la funcion.

window.addCart = function(id) {
    const cardSelected = localdata.find((g) => g.id === id);
    if (cardSelected) {
        addToCartLogic(cardSelected ); // Le pasamos el objeto entero
    }
};
let localdata = [];
 
// Tu función init y fetch van aquí...
console.log(contentGrid);

// Variables globales


//---------------------------------------------//
// Funciones de datos
//---------------------------------------------//

async function getData() {
  try {
    const response = await fetch("./data/main-data.json");
    if (!response.ok) {
      throw new Error("Error cargando los datos");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    if(contentGrid) {
        contentGrid.innerHTML = "<p>Error cargando los videojuegos.</p>";
    }
  }
}

//---------------------------------------------//
// Función Render Principal
//---------------------------------------------//

function renderCards(data) {
  // Limpiamos e inyectamos la sección del Hero primero
  contentGrid.innerHTML = `
    <section class="hero-section">
        <div class="placeholder-img-large">
            <img src="https://m.media-amazon.com/images/I/A1ACfoI4+AL._SX3000_.jpg" alt="Banner principal" class="hero-img">
        </div>
    </section>
  `;

  // Iteramos sobre los datos
  data.forEach((item) => {
    const div = document.createElement("div");
    div.className = "card"; 
    div.innerHTML = `
        <h3>${item.title}</h3>
        <div class="placeholder-img">
            <img src="${item.image}" alt="${item.title}">
        </div>
        <a href="#">Ver más</a>
        <button class="add-cart-btn" onclick="addCart(${item.id})">Añadir al carrito</button>
    `;
    contentGrid.appendChild(div); 
  });
}


//---------------------------------------------//
// Funciones de LocalStorage
//---------------------------------------------//

// Inicializar
async function init() {
  const data = await getData();
  if (data) { 
    localdata = data
    renderCards(data);
  }
}

init();
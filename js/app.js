import { PALABRAS } from "./datos.js";




// Definir elementos del DOM


const pantallaComienzo = document.getElementById("pantallaComienzo");
const pantallaJuego = document.getElementById("pantallaJuego");
const pantallaFinal = document.getElementById("pantallaFinal");


const usernameInput = document.getElementById("username");
const startBtn = document.getElementById("startBtn");

const categoriaLabel = document.getElementById("categoriaLabel");
const usuarioLabel = document.getElementById("usuarioLabel");
const tiempoLabel = document.getElementById("tiempoLabel");
const errorLabel = document.getElementById("errorLabel");

const mascara = document.getElementById("mascara");
const letras = document.getElementById("letras");
const ahorcado = document.getElementById("ahorcado");

const nuevaPalabraBtn = document.getElementById("nuevaPalabra");

const tiempoFinalLabel = document.getElementById("tiempoFinal");
const mensajeFinalLabel = document.getElementById("mensajeFinal");
const imagenFinal = document.getElementById("imagenFinal");
const infoFinal = document.getElementById("infoFinal");
const jugarDeNuevoBtn = document.getElementById("jugarDeNuevo");



// ALFABETO

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


// CONFIG

const MAX_ERRORES = 10;
const STORAGE_KEY = "juegoAhorcadoData";


let estado = null;
let segundos = 0;
let temporizador = null;


function elegirPalabraAleatoria() {

    const indice = Math.floor(Math.random() * PALABRAS.length);
    return PALABRAS[indice];

}


function iniciarJuego() {

    const username = usernameInput.value.trim();
    if (!username) {
        alert("introdueix un nom d'usuari.");
        return;
    }

    const palabraEscogida = elegirPalabraAleatoria();


    segundos = 0;
    tiempoLabel.textContent = "0";

    estado = {
        username,
        palabraEscogida,
        usadas: [],
        correctas: [],
        errores: 0,
        progreso: "jugando"
    };

    iniciarTiempo();

    // Cambiar entre pantallas

    pantallaComienzo.hidden = true;
    pantallaFinal.hidden = true;
    pantallaJuego.hidden = false;

    actualizarUI();

    guardarPartida();

}


function actualizarInfo() {

    usuarioLabel.textContent = estado.username;
    categoriaLabel.textContent = estado.palabraEscogida.categoria;
    errorLabel.textContent = String(estado.errores);
    tiempoLabel.textContent = String(segundos);

}

function renderizarMascara() {


   /*  split("") convierte la palabra en array de letras
  - map crea un array nuevo transformado
  - join(" ") lo une con espacios
*/

    const palabraRenderizada = estado.palabraEscogida.palabra;
    const caracteres = palabraRenderizada.split("").map(letra => {
        if (estado.correctas.includes(letra)) {
            return letra;
        } else {
            return "_";
        }
    });

    mascara.textContent = caracteres.join(" ");

}


function crearTeclado() {

    letras.innerHTML = "";

    ALFABETO.forEach(letra => {

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = letra;


        if (estado.usadas.includes(letra) || estado.progreso !== "jugando") {
            boton.disabled = true;
        }

        boton.addEventListener("click", () => ClickLetra(letra));

        letras.appendChild(boton);

    });

}


function actualizarUI() {
    actualizarInfo();
    renderizarMascara();
    crearTeclado();
    renderizarAhorcado();
}



function ClickLetra(letra) {
    
    if (estado.progreso !== "jugando") {
        return;
    }

    if (estado.usadas.includes(letra)) {
        return;
    }

    estado.usadas.push(letra);

    const palabra = estado.palabraEscogida.palabra;

    if (palabra.includes(letra)) {

        if (!estado.correctas.includes(letra)) {
            estado.correctas.push(letra);
        }
        


        actualizarUI();

        comprobarVictoria();

        return;

    }

    

    estado.errores+= 1;

    actualizarUI();

    if (estado.errores >= MAX_ERRORES) {
        terminarPartida(false);
    }

    guardarPartida();
}


function comprobarVictoria() {

    const letrasUnicas = [...new Set(estado.palabraEscogida.palabra.split(""))];
    const haGanado = letrasUnicas.every(letra => estado.correctas.includes(letra));
    if (haGanado) {
        terminarPartida(true);
    }
}


function terminarPartida(haGanado) {
    pararTiempo();
    estado.progreso = haGanado ? "victoria" : "derrota";

    pantallaJuego.hidden = true;
    pantallaFinal.hidden = false;

    mensajeFinalLabel.textContent = haGanado ? "Felicitats! Has guanyat!" : "Oh no! Has perdut!";

    infoFinal.textContent = estado.palabraEscogida.info;
    imagenFinal.src = estado.palabraEscogida.img;
    borrarPartida();
}



const DIBUJOS = [
``,
`
______
`,
`
|
|
|
|
|
|______
`,
`
|------
|
|
|
|
|______
`,
`
|------
|    |
|
|
|
|______
`,
`
|------
|    |
|    O
|
|
|______
`,
`
|------
|    |
|    O
|    |
|
|______
`,
`
|------
|    |
|    O
|   /|
|
|______
`,
`
|------
|    |
|    O
|   /|\\
|
|______
`,
`
|------
|    |
|    O
|   /|\\
|   /
|______
`,
`
|------
|    |
|    O
|   /|\\
|   / \\
|______
`
];


function renderizarAhorcado () {

    ahorcado.textContent = DIBUJOS[estado.errores];

}

function iniciarTiempo() {
    pararTiempo();

    temporizador = setInterval(() => {
        segundos++;
        tiempoLabel.textContent = segundos;
        guardarPartida();
    }, 1000);

    

}

function pararTiempo() {
    if (temporizador) {
        clearInterval(temporizador);
        temporizador = null;
    }
}



function guardarPartida() {
    
    const datosAGuardar = {
        estado,
        segundos
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(datosAGuardar));
}

function cargarPartida() {
const datosGuardados = localStorage.getItem(STORAGE_KEY);
if (!datosGuardados) {
    return false;
}

const datos = JSON.parse(datosGuardados);
estado = datos.estado;
segundos = datos.segundos;

return true;

}


if (cargarPartida()) {


  if (estado.progreso !== "jugando") {

    borrarPartida();
    pantallaComienzo.hidden = false;
    pantallaJuego.hidden = true;
    pantallaFinal.hidden = true;

  } else {
    pantallaComienzo.hidden = true;
    pantallaFinal.hidden = true;
    pantallaJuego.hidden = false;

    actualizarUI();
    iniciarTiempo();
  }
}



function borrarPartida() {
    localStorage.removeItem(STORAGE_KEY);
}





startBtn.addEventListener("click", iniciarJuego);

nuevaPalabraBtn.addEventListener("click", () => {
    if (!estado) {
        return
    }
    iniciarJuego();
});

jugarDeNuevoBtn.addEventListener("click", () => {
    pantallaFinal.hidden = true;
    pantallaComienzo.hidden = false;
});




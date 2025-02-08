/* CONFIGURACIÓN DE FIREBASE */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "clave_api_google",
    authDomain: "mateaprende-de9ba.firebaseapp.com",
    projectId: "mateaprende-de9ba",
    storageBucket: "mateaprende-de9ba.appspot.com",
    messagingSenderId: "422048472119",
    appId: "1:422048472119:web:3dc525d481ae431aa3b3b2",
    measurementId: "G-MVL25V0LQG"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        // El usuario no está autenticado, redirigir al inicio de sesión
        window.location.href = "/login";
    }
});

// Avatar por ID
const avatar = document.getElementById("avatar");
const avatar_hablando = document.getElementById("avatar_hablando");

avatar_hablando.style.display = "none";

function leerEnVozAlta(elemento) {
    var mensaje = new SpeechSynthesisUtterance(elemento);

    mensaje.onstart = function () { // Detectar si la síntesis de voz esta hablando
        avatar.style.display = "none";
        avatar_hablando.style.display = "block";
    };

    window.speechSynthesis.speak(mensaje);

    mensaje.onend = function () { // Detectar si la síntesis de voz terminó de hablar
        avatar_hablando.style.display = "none";
        avatar.style.display = "block";
    };
}

window.onload = function () {
    var elementoTexto = document.getElementById('ejercicio');
    var textoReemplazado = elementoTexto.textContent.replace(/x/g, 'por');
    leerEnVozAlta(textoReemplazado);
};
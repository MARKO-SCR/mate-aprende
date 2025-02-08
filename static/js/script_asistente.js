// Referencias por ID
const btnMultiplicar = document.getElementById("btnMultiplicar");
const btnDividir = document.getElementById("btnDividir");
const btnMicrofono = document.getElementById("btnMicrofono");
const contenedorBotones = document.getElementById("contenedorBotones");
const hola = document.getElementById("hola");

// Sonidos
const sonido_bot = document.getElementById('sonido_bot');
const sonido_mensaje = document.getElementById('sonido_mensaje');
const sonido_microfono = document.getElementById('sonido_microfono');

// Avatar por ID
const avatar = document.getElementById("avatar");
const avatar_hablando = document.getElementById("avatar_hablando");

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

function cerrarSesion() {
    // Cerrar sesión con Firebase Auth
    firebase
        .auth()
        .signOut()
        .then(function () {
            // Redirigir a la página de inicio después del cierre de sesión
            window.location.replace("/login");
        })
        .catch(function (error) {
            // Manejar errores de cierre de sesión
            console.error(error);
            alert("Error al cerrar sesión: " + error.message);
        });
}

// Función para realizar un desplazamiento automático hacia abajo en un div
function scrollAutomatico() {
    const miDiv = document.getElementById('ContenedorChat');
    // Puedes ajustar la velocidad y la posición de destino según tus necesidades
    miDiv.scrollTop = miDiv.scrollHeight;
}

// Después de cargar la página, inicia el desplazamiento automático
window.onload = function () {
    scrollAutomatico();
    sonido_bot.play();
};

// Cambia el estilo de visualización para ocultar el botón
btnMultiplicar.style.display = "none";
btnDividir.style.display = "none";
btnMicrofono.style.display = "none";

// Ocultar avatar_hablando
avatar_hablando.style.display = "none";

function eliminarBoton() {
    // Obtén una referencia al botón
    var boton = document.getElementById("btnBienvenida");

    // Verifica si el botón existe
    if (boton) {
        // Elimina el botón
        boton.parentNode.removeChild(boton);
        // Muestra el micrófono
        btnMicrofono.style.display = "block";
        contenedorBotones.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function () { // Evento DOMContentLoaded
    const chat = document.getElementById('chat');
    const btnMicrofono = document.getElementById('btnMicrofono');
    const btnBienvenida = document.getElementById('btnBienvenida');

    // Función para agregar una voz de bienvenida
    function bienvenida() {
        const sintetizador = window.speechSynthesis;
        const mensajeBienvenida = '¡Bienvenido a MateAprende! Seré tu asistente personal que te ayudará en tu proceso de aprendizaje. Activa tu micrófono para comenzar.';
        const bienvenida = new SpeechSynthesisUtterance(mensajeBienvenida);
        bienvenida.rate = 1.5; // Aumentar la velocidad de la voz

        bienvenida.onstart = function () { // Detectar si la síntesis de voz esta hablando
            avatar.style.display = "none";
            avatar_hablando.style.display = "block";
        };

        sintetizador.speak(bienvenida);

        bienvenida.onend = function () { // Detectar si la síntesis de voz terminó de hablar
            avatar_hablando.style.display = "none";
            avatar.style.display = "block";
        };
    }

    // Habilitar el reconocimiento de voz
    function reconocimientoVoz() {
        const reconocimientoVoz = new webkitSpeechRecognition();
        reconocimientoVoz.onresult = function (event) {
            const mensajeUsuario = event.results[0][0].transcript;
            chat.innerHTML += "<div class='contenedorUsuarioBot'><img class='usuarioBot' src='../static/images/usuario.png' width=35 height=35 alt='usuario'/>" + "<p id='mensajeUsuarioBot'>" + mensajeUsuario + "</p><div/>";

            // Envía el mensaje al servidor Flask como datos de formulario
            const datos = new FormData();
            datos.append('entrada_usuario', mensajeUsuario);

            fetch('/asistente_virtual', {
                method: 'POST',
                body: datos
            })
                .then(response => response.json())
                .then(data => {
                    const sintetizador = window.speechSynthesis;
                    const respuestaBot = data.response;

                    // Reemplazar caracteres
                    const respuestaHablada = respuestaBot.replace(/x/g, 'por').replace(/÷/g, 'entre');

                    chat.innerHTML += "<div class='contenedorUsuarioBot'><img class='usuarioBot' src='../static/images/bot.png' width=35 height=35 alt='bot'/>" + "<p id='mensajeUsuarioBot'>" + respuestaBot + "</p><div/>";
                    scrollAutomatico();

                    const bot = new SpeechSynthesisUtterance(respuestaHablada);
                    bot.rate = 1.5; // Velocidad de la voz del bot

                    bot.onstart = function () { // Detectar si la síntesis de voz esta hablando
                        avatar.style.display = "none";
                        avatar_hablando.style.display = "block";
                    };

                    sintetizador.speak(bot); // Síntesis te voz hablando

                    bot.onend = function () { // Detectar si la síntesis de voz terminó de hablar
                        avatar_hablando.style.display = "none";
                        avatar.style.display = "block";
                    };

                    /* MULTIPLICACIÓN */

                    // CONCEPTO_MULTIPLICACIÓN
                    if (respuestaBot == "La multiplicación es una operación matemática que consiste en encontrar el resultado de multiplicar una cifra por otra. Multiplicar consiste en añadir o sumar un número varias veces, por ejemplo, la operación 2 x 3 equivale sumar tres veces el número 2, en ambas el resultado es 6. ¿Hay algo en particular que te gustaría saber sobre la multiplicación?") {
                        chat.innerHTML += "<div class = 'contenedorImgChat'><img class='imgChat' src='/static/images/concepto_multiplicacion.png' alt='Multiplicación'/></div>";
                        scrollAutomatico();
                    }

                    // PARTES_MULTIPLICACIÓN
                    if (respuestaBot == "En matemática, la multiplicación tiene tres partes que la componen:\n • Multiplicando: es el número que va a ser multiplicado.\n • Multiplicador: es el componente que indica cuántas veces se va a sumar el multiplicando.\n • Producto: es el resultado o solución de la multiplicación.\nAl multiplicando y al multiplicador también se les llama factores.") {
                        chat.innerHTML += "<div class = 'contenedorImgChat'><img class='imgChat' src='/static/images/partes_multiplicacion.png' alt='Multiplicación'/></div>";
                        scrollAutomatico();
                    }

                    // VIDEO_MULTIPLICACIÓN
                    if (respuestaBot == "¡Claro! Aquí tienes un video educativo sobre la multiplicación. ¡Espero que encuentres útil la información!") {
                        chat.innerHTML += "<div class = 'contenedorVideoChat'><video width='640' height='360' controls><source src='/static/videos/Aprende_multiplicación.mp4' type='video/mp4'>Tu navegador no soporta el elemento de video.</video></div>";
                        scrollAutomatico();
                    }

                    // TABLA_MULTIPLICAR
                    if (respuestaBot == "¡Claro! Aquí tienes la tabla de multiplicar hasta el 10. ¿Hay algo más en lo que pueda ayudarte?") {
                        chat.innerHTML += "<div class = 'contenedorImgChat'><img width='700' class='imgChat' src='/static/images/tabla_multiplicar.png' alt='Tabla_multiplicación'/></div>";
                        scrollAutomatico();
                    }

                    // EJERCICIOS_MULTIPLICACIÓN
                    if (respuestaBot == "Perfecto, empezaremos con los ejercicios de multiplicación... Haz clic en el siguiente botón para comenzar.") {
                        btnMicrofono.style.display = "none";
                        hola.style.display = "none";
                        btnMultiplicar.style.display = "block";
                        scrollAutomatico();
                    }

                    /* DIVISIÓN */

                    // CONCEPTO_DIVISIÓN
                    if (respuestaBot == "La división es una de las operaciones básicas de la aritmética y consiste en separar en partes iguales un total. Es decir, si tenemos una cantidad y queremos dividirla en partes iguales, podemos utilizar la división para determinar cuántas partes iguales obtenemos y qué cantidad corresponde a cada parte. Por ejemplo, si tenemos 10 unidades y queremos dividirlas en 5 partes iguales, corresponderán 2 unidades a cada parte. ¿Hay algo en particular que te gustaría saber sobre la división?") {
                        chat.innerHTML += "<div class = 'contenedorImgChat'><img class='imgChat' src='/static/images/concepto_division.png' alt='División'/></div>";
                        scrollAutomatico();
                    }

                    // PARTES_DIVISIÓN
                    if (respuestaBot == "Una división está formada por cuatro elementos:\n • Dividendo: es la cantidad total que se quiere repartir en partes iguales.\n • Divisor: es la cantidad de partes en la que se va a dividir el dividendo.\n • Cociente: es el resultado de la división. En otras palabras, es el número de veces que el divisor “cabe” en el dividendo.\n • Resto: es la cantidad que queda sobrante después de realizar una división cuyo resultado no es exacto.\nPor ejemplo, si dividiéramos 10 ÷ 5 obtendríamos un cociente de 2 y un resto de 0.") {
                        chat.innerHTML += "<div class = 'contenedorImgChat'><img class='imgChat' src='/static/images/partes_division.png' alt='Multiplicación'/></div>";
                        scrollAutomatico();
                    }

                    // VIDEO_DIVISIÓN
                    if (respuestaBot == "¡Claro! Aquí tienes un video educativo sobre la división. ¡Espero que encuentres útil la información!") {
                        chat.innerHTML += "<div class = 'contenedorVideoChat'><video width='640' height='360' controls><source src='/static/videos/Aprende_división.mp4' type='video/mp4'>Tu navegador no soporta el elemento de video.</video></div>";
                        scrollAutomatico();
                    }

                    // EJERCICIOS_DIVISIÓN
                    if (respuestaBot == "Perfecto, empezaremos con los ejercicios de división... Haz clic en el siguiente botón para comenzar.") {
                        btnMicrofono.style.display = "none";
                        hola.style.display = "none";
                        btnDividir.style.display = "block";
                        scrollAutomatico();
                    }
                });
        };

        reconocimientoVoz.start();
    }

    btnBienvenida.addEventListener('click', function () {
        bienvenida();
    });

    btnMicrofono.addEventListener('click', function () {
        sonido_microfono.play();
        reconocimientoVoz();
    });
});

/* MODAL DE CERRAR SESIÓN */

function openSesionModal() {
    sonido_mensaje.play();
    var modal = document.getElementById("CerrarSesionModal");
    modal.style.display = "block";
}

function closeSesionModal() {
    var modal = document.getElementById("CerrarSesionModal");
    modal.style.display = "none";
}
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

document.addEventListener("DOMContentLoaded", function () {
    // Verificar si el usuario está autenticado al cargar la página
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // El usuario está autenticado
            if (user.emailVerified) {
                // El correo electrónico está verificado, redirigir a la página de asistente
                window.location.replace("/asistente");
            } else {
                firebase.auth().signOut(); // Cierra la sesión
            }
        } else {
            // El usuario no está autenticado, mostrar el formulario de inicio de sesión
            document.getElementById("login-form").style.display = "block";
        }
    });
});

// Función para registrar un nuevo usuario
function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Verificar si el correo electrónico ya está en uso
    firebase.auth().fetchSignInMethodsForEmail(email)
        .then((methods) => {
            if (methods.length === 0) {
                // El correo electrónico no está en uso, se puede proceder con el registro
                return firebase.auth().createUserWithEmailAndPassword(email, password);
            } else {
                return Promise.reject('El correo electrónico ya está registrado.'); // Rechazar la promesa para evitar ejecutar el siguiente bloque `then`
            }
        })
        .then(() => {
            // Usuario registrado con éxito
            return sendEmailVerification(); // Retorna la promesa de sendEmailVerification
        })
        .then(() => {
            // Continuar con el envío del formulario
            document.getElementById('registroForm').submit();
        })
        .catch((error) => {
            // Manejar otros errores
            console.error(error.message);
            openCuentaErrorModal();
        });
}

// Función para enviar correo de verificación
function sendEmailVerification() {
    const user = firebase.auth().currentUser;

    user.sendEmailVerification()
        .then(() => {
            console.log('Correo de verificación enviado');
        })
        .catch((error) => {
            console.error('Error al enviar el correo de verificación:', error.message);
        });
}

// Función para enviar correo de recuperación de contraseña
function enviarCorreoRecuperacion() {
    const email = document.getElementById('email-recuperacion').value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            // Correo de recuperación enviado con éxito
            console.log('Correo de recuperación enviado');
            openRecuperarCuentaModal();
        })
        .catch((error) => {
            // Manejar errores
            console.error('Error al enviar el correo de recuperación:', error.message);
            alert('Error al enviar el correo de recuperación: ' + error.message);
        });
}

// Función para iniciar sesión
async function iniciarSesion() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        // Utiliza Firebase Auth para iniciar sesión con email y contraseña
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        // Verifica si el correo electrónico está verificado
        const user = userCredential.user;
        if (user.emailVerified) {
            // El usuario ha iniciado sesión con éxito y su correo está verificado
            console.log("Usuario autenticado:", user);
            // Redirige a la página del asistente
            window.location.href = "/asistente";
        } else {
            openVerificacionModal();
            await firebase.auth().signOut(); // Cierra la sesión
        }
    } catch (error) {
        // Manejar errores de inicio de sesión
        console.error("Error al iniciar sesión:", error.message);
        openInicioSesionModal();
    }
}

const togglePassword = (passwordFieldId, iconId) => {
    const contra = document.getElementById(passwordFieldId);
    const icono = document.getElementById(iconId);

    icono.addEventListener("click", () => {
        if (contra.type === "password") {
            contra.type = "text";
            icono.classList.remove('bx-hide');
            icono.classList.add('bx-show-alt');
        } else {
            contra.type = "password";
            icono.classList.add('bx-hide');
            icono.classList.remove('bx-show-alt');
        }
    });
};

// Configurar para el primer campo de contraseña (LOGIN)
togglePassword("login-password", "icon-1");

// Configurar para el segundo campo de contraseña (SIGN UP)
togglePassword("password", "icon-2");

/* MODAL DE REGISTRO */

function openSignupModal() {
    var modal = document.getElementById("signupModal");
    modal.style.display = "block";
}

function closeSignupModal() {
    var modal = document.getElementById("signupModal");
    modal.style.display = "none";
}

/* MODAL DE OLVIDAR CONTRASEÑA */

function openOlvidarModal() {
    var modal = document.getElementById("olvidarModal");
    modal.style.display = "block";
}

function closeOlvidarModal() {
    var modal = document.getElementById("olvidarModal");
    modal.style.display = "none";
}

/* MODAL DE VERIFICACIÓN */

function openVerificacionModal() {
    var modal = document.getElementById("verificacionModal");
    modal.style.display = "block";
}

function closeVerificacionModal() {
    var modal = document.getElementById("verificacionModal");
    modal.style.display = "none";
}

/* MODAL DE INICIO DE SESIÓN */

function openInicioSesionModal() {
    var modal = document.getElementById("inicioSesionModal");
    modal.style.display = "block";
}

function closeInicioSesionModal() {
    var modal = document.getElementById("inicioSesionModal");
    modal.style.display = "none";
}

/* MODAL DE RECUPERACIÓN DE CUENTA */

function openRecuperarCuentaModal() {
    var modal = document.getElementById("recuperacionCuentaModal");
    modal.style.display = "block";
}

function closeRecuperarCuentaModal() {
    var modal = document.getElementById("recuperacionCuentaModal");
    modal.style.display = "none";
}

/* MODAL DE CUENTA EXISTENTE */

function openCuentaErrorModal() {
    var modal = document.getElementById("cuentaErrorModal");
    modal.style.display = "block";
}

function closeCuentaErrorModal() {
    var modal = document.getElementById("cuentaErrorModal");
    modal.style.display = "none";
}
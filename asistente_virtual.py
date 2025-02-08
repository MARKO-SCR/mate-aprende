"""
ASISTENTE VIRTUAL
"""

import urllib.parse
import random
import json
import pickle
import numpy as np

from flask import Flask, render_template, request, redirect
import nltk
from nltk.stem import WordNetLemmatizer
from keras.models import load_model

import mysql.connector
from werkzeug.security import generate_password_hash

app = Flask(__name__)

# Configuración de la base de datos
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "mate_aprende",
}


# Función para conectar y desconectar la base de datos
def conectar_bd():
    """
    Función para conectar a la bd
    """
    return mysql.connector.connect(**db_config)


def desconectar_bd(conn):
    """
    Función para desconectar de la bd
    """
    conn.close()


# Ruta para el formulario de registro
@app.route("/registro", methods=["GET", "POST"])
def registro():
    """
    Función para el registro en el base de datos
    """
    if request.method == "POST":
        # Obtener datos del formulario
        nombre = request.form["nombre"]
        apellido = request.form["apellido"]
        correo = request.form["email"]

        # Verificar si el correo ya está registrado
        conn = conectar_bd()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM usuario WHERE correo = %s", (correo,))
        resultado = cursor.fetchone()

        if resultado:
            # El correo ya está registrado, puedes manejar esto como desees (redirigir a una página de error, etc.)
            desconectar_bd(conn)
            return render_template("registro_exitoso.html")

        # Encriptar la contraseña antes de almacenarla
        contrasena_plana = request.form["password"]
        contrasena_encriptada = generate_password_hash(contrasena_plana)

        fecha_nacimiento = (
            f"{request.form['anio']}-{request.form['mes']}-{request.form['dia']}"
        )
        sexo = request.form["sexo"]

        # Insertar datos en la base de datos, usando la contraseña encriptada
        cursor.execute(
            "INSERT INTO usuario (nombre, apellido, correo, contrasena, fecha_nacimiento, sexo) VALUES (%s, %s, %s, %s, %s, %s)",
            (nombre, apellido, correo, contrasena_encriptada, fecha_nacimiento, sexo),
        )

        # Confirmar y cerrar la conexión
        conn.commit()
        desconectar_bd(conn)

        return render_template("registro_exitoso.html")

    return render_template("registro_exitoso.html")


lematizador = WordNetLemmatizer()

# Importamos los archivos generados en el código anterior
intents = json.loads(open("intents.json", encoding="UTF-8").read())
palabras = pickle.load(open("palabras.pkl", "rb"))
clases = pickle.load(open("clases.pkl", "rb"))
modelo = load_model("modelo_asistente.h5")


# Pasamos las palabras de oración a su forma raíz
def clean_up_sentence(oracion):
    """
    Pasamos las palabras de oración a su forma raíz
    """
    palabras_oracion = nltk.word_tokenize(oracion)
    palabras_oracion = [lematizador.lemmatize(palabra) for palabra in palabras_oracion]
    return palabras_oracion


# Convertimos la información a unos y ceros según si están presentes en los patrones
def bag_of_words(oracion):
    """
    Convertimos la información a unos y ceros según si están presentes en los patrones
    """
    palabras_oracion = clean_up_sentence(oracion)
    bag = [0] * len(palabras)
    for w in palabras_oracion:
        for i, palabra in enumerate(palabras):
            if palabra == w:
                bag[i] = 1
    print(bag)
    return np.array(bag)


# Predecimos la categoría a la que pertenece la oración
def predict_class(oracion):
    """
    Predecimos la categoría a la que pertenece la oración
    """
    bow = bag_of_words(oracion)
    res_local = modelo.predict(np.array([bow]))[0]
    indice_maximo = np.where(res_local == np.max(res_local))[0][0]
    categoria = clases[indice_maximo]
    return categoria


# Obtenemos una respuesta aleatoria
def get_response(tag, intents_json):
    """
    Obtenemos una respuesta aleatoria
    """
    lista_intents = intents_json["intents"]
    resultado = ""
    for i in lista_intents:
        if i["tag"] == tag:
            resultado = random.choice(i["responses"])
            break
    return resultado


# Función para las respuestas
def asistente_virtual(texto_entrada):
    """
    Función para las respuestas
    """

    entradas = predict_class(texto_entrada)
    response = get_response(entradas, intents)

    return response


# CORRER EN LA WEB
@app.route("/")
def index():
    """
    Función para cargar el index
    """
    return render_template("index.html")


@app.route("/sugerencias")
def sugerencias():
    """
    Función para cargar el form de sugerencias
    """
    return render_template("sugerencias.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """
    Función para cargar el login
    """
    return render_template("login.html")


@app.route("/asistente", methods=["GET", "POST"])
def asistente_web():
    """
    Función para cargar el asistente
    """
    return render_template("asistente.html")


@app.route("/asistente_virtual", methods=["POST"])
def asistente():
    """
    Función para pasar datos al cliente (javascript)
    """
    entrada_usuario = request.form["entrada_usuario"]
    response = asistente_virtual(entrada_usuario)
    return {"response": response}


@app.route("/enviar_sugerencia", methods=["POST"])
def enviar_sugerencia():
    """
    Función para enviar sugerencia del usuario
    """
    if request.method == "POST":
        nombres = request.form["txtNombres"]
        apellidos = request.form["txtApellidos"]
        sugerencia = request.form["txtSugerencia"]

        # Codifica el nombre, correo y sugerencia como parámetros en la URL
        nombres_codificado = urllib.parse.quote(nombres)
        apellidos_codificado = urllib.parse.quote(apellidos)
        sugerencia_codificada = urllib.parse.quote(sugerencia)

        # Redirige al cliente de correo electrónico predeterminado (Gmail)
        url = f"mailto:mateaprende360@gmail.com?subject=Nueva%20Sugerencia&body=Nombres:%20{nombres_codificado}%0A%0AApellidos:%20{apellidos_codificado}%0A%0ASugerencia:%20{sugerencia_codificada}"
        return redirect(url)


@app.route("/enviar_contactanos", methods=["POST"])
def enviar_contactanos():
    """
    Función para enviar sugerencia del usuario
    """
    if request.method == "POST":
        nombres = request.form["nombres"]
        apellidos = request.form["apellidos"]
        mensaje = request.form["mensaje"]

        # Codifica el nombre, correo y sugerencia como parámetros en la URL
        nombres_codificado = urllib.parse.quote(nombres)
        apellidos_codificado = urllib.parse.quote(apellidos)
        mensaje_codificado = urllib.parse.quote(mensaje)

        # Redirige al cliente de correo electrónico predeterminado (Gmail)
        url = f"mailto:mateaprende360@gmail.com?subject=Nuevo%20Contacto&body=Nombres:%20{nombres_codificado}%0A%0AApellidos:%20{apellidos_codificado}%0A%0AMensaje:%20{mensaje_codificado}"
        return redirect(url)


# PÁGINA - MULTIPLICACIÓN

EJERCICIO = None
RESPUESTA_CORRECTA = None
INTENTOS = 0
INTENTOS_RESTANTES = 3


def ejercicio_multiplicar():
    """
    Función para generar ejercicios de multiplicación
    """
    num1 = random.randint(1, 10)
    num2 = random.randint(1, 10)
    operador = "x"
    respuesta = num1 * num2
    return f"{num1} {operador} {num2}", respuesta


@app.route("/multiplicar")
def multiplicar():
    """
    Función para cargar la página de multiplicación
    """
    global EJERCICIO, RESPUESTA_CORRECTA, INTENTOS, INTENTOS_RESTANTES
    EJERCICIO, RESPUESTA_CORRECTA = ejercicio_multiplicar()
    INTENTOS = 0
    INTENTOS_RESTANTES = 3
    return render_template(
        "multiplicar.html", EJERCICIO=EJERCICIO, INTENTOS_RESTANTES=INTENTOS_RESTANTES
    )


@app.route("/validarMultiplicacion", methods=["POST"])
def validar_multiplicacion():
    """
    Función para validar la multiplicación
    """
    global EJERCICIO, RESPUESTA_CORRECTA, INTENTOS, INTENTOS_RESTANTES
    respuesta_usuario = request.form["respuesta_usuario"]
    INTENTOS += 1

    if respuesta_usuario == str(RESPUESTA_CORRECTA):
        resultado = "¡Correcto! La respuesta es " + str(RESPUESTA_CORRECTA) + "."
        EJERCICIO, RESPUESTA_CORRECTA = ejercicio_multiplicar()
        INTENTOS = 0
        INTENTOS_RESTANTES = 3
    else:
        resultado = "Respuesta incorrecta. Inténtalo de nuevo."
        INTENTOS_RESTANTES -= 1

        if INTENTOS_RESTANTES == 0:
            resultado = (
                "No adivinaste el ejercicio en 3 intentos. La respuesta correcta era "
                + str(RESPUESTA_CORRECTA)
                + "."
            )
            EJERCICIO, RESPUESTA_CORRECTA = ejercicio_multiplicar()
            INTENTOS = 0
            INTENTOS_RESTANTES = 3

    return render_template(
        "multiplicar.html",
        EJERCICIO=EJERCICIO,
        resultado=resultado,
        INTENTOS_RESTANTES=INTENTOS_RESTANTES,
    )


# PÁGINA - DIVISIÓN


def ejercicio_dividir():
    """
    Función para generar ejercicios de división
    """
    num1 = random.randint(1, 30)
    num2 = random.randint(1, 30)

    # Calcular el cociente y el residuo
    cociente, residuo = divmod(num1, num2)

    # Verificar que el residuo sea cero
    while residuo != 0:
        num1 = random.randint(1, 30)
        num2 = random.randint(1, 30)
        cociente, residuo = divmod(num1, num2)

    operador = "÷"
    respuesta = cociente
    return f"{num1} {operador} {num2}", respuesta


@app.route("/dividir")
def dividir():
    """
    Función para cargar la página de división
    """
    global EJERCICIO, RESPUESTA_CORRECTA, INTENTOS, INTENTOS_RESTANTES
    EJERCICIO, RESPUESTA_CORRECTA = ejercicio_dividir()
    INTENTOS = 0
    INTENTOS_RESTANTES = 3
    return render_template(
        "dividir.html", EJERCICIO=EJERCICIO, INTENTOS_RESTANTES=INTENTOS_RESTANTES
    )


@app.route("/validarDivision", methods=["POST"])
def validar_division():
    """
    Función para validar la división
    """
    global EJERCICIO, RESPUESTA_CORRECTA, INTENTOS, INTENTOS_RESTANTES
    respuesta_usuario = request.form["respuesta_usuario"]
    INTENTOS += 1

    if respuesta_usuario == str(RESPUESTA_CORRECTA):
        resultado = "¡Correcto! La respuesta es " + str(RESPUESTA_CORRECTA) + "."
        EJERCICIO, RESPUESTA_CORRECTA = ejercicio_dividir()
        INTENTOS = 0
        INTENTOS_RESTANTES = 3
    else:
        resultado = "Respuesta incorrecta. Inténtalo de nuevo."
        INTENTOS_RESTANTES -= 1

        if INTENTOS_RESTANTES == 0:
            resultado = (
                "No adivinaste el ejercicio en 3 intentos. La respuesta correcta era "
                + str(RESPUESTA_CORRECTA)
                + "."
            )
            EJERCICIO, RESPUESTA_CORRECTA = ejercicio_dividir()
            INTENTOS = 0
            INTENTOS_RESTANTES = 3

    return render_template(
        "dividir.html",
        EJERCICIO=EJERCICIO,
        resultado=resultado,
        INTENTOS_RESTANTES=INTENTOS_RESTANTES,
    )


if __name__ == "__main__":
    app.run(debug=True)

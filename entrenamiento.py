"""
ENTRENAMIENTO
"""

import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer  # Para pasar las palabras a su forma raíz

# Para crear la red neuronal
from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.optimizers import SGD
from keras.optimizers.schedules import ExponentialDecay

lematizador = WordNetLemmatizer()

intents = json.loads(open("intents.json", encoding="UTF-8").read())

nltk.download("punkt")
nltk.download("wordnet")
nltk.download("omw-1.4")

palabras = []
clases = []
documentos = []
ignorar_letras = ["?", "!", "¿", ".", ","]

# Clasifica los patrones y las categorías
for intent in intents["intents"]:
    for pattern in intent["patterns"]:
        lista_palabras = nltk.word_tokenize(pattern)
        palabras.extend(lista_palabras)
        documentos.append((lista_palabras, intent["tag"]))
        if intent["tag"] not in clases:
            clases.append(intent["tag"])

palabras = [
    lematizador.lemmatize(palabra)
    for palabra in palabras
    if palabra not in ignorar_letras
]
palabras = sorted(set(palabras))

pickle.dump(palabras, open("palabras.pkl", "wb"))
pickle.dump(clases, open("clases.pkl", "wb"))

# Pasa la información a unos y ceros según las palabras presentes en cada categoría para hacer el entrenamiento
entrenamiento = []
salida_vacia = [0] * len(clases)
for documento in documentos:
    bag = []
    patrones_palabras = documento[0]
    patrones_palabras = [
        lematizador.lemmatize(palabra.lower()) for palabra in patrones_palabras
    ]
    for palabra in palabras:
        bag.append(1 if palabra in patrones_palabras else 0)
    fila_salida = list(salida_vacia)
    fila_salida[clases.index(documento[1])] = 1
    entrenamiento.append([bag, fila_salida])
random.shuffle(entrenamiento)
entrenamiento = np.array(entrenamiento)
print(entrenamiento)

# Reparte los datos para pasarlos a la red
entrenar_x = list(entrenamiento[:, 0])
entrenar_y = list(entrenamiento[:, 1])

# Creamos la red neuronal
modelo = Sequential()
modelo.add(Dense(128, input_shape=(len(entrenar_x[0]),), activation="relu"))
modelo.add(Dropout(0.5))
modelo.add(Dense(64, activation="relu"))
modelo.add(Dropout(0.5))
modelo.add(Dense(len(entrenar_y[0]), activation="softmax"))

# Definir el learning rate schedule (tasa de aprendizaje inicial)
TASA_APRENDIZAJE_INICIAL = 0.001
ta_horario = ExponentialDecay(
    TASA_APRENDIZAJE_INICIAL, decay_steps=10000, decay_rate=0.9
)

# Creamos el optimizador y lo compilamos
sgd = SGD(learning_rate=ta_horario, momentum=0.9, nesterov=True)
modelo.compile(loss="categorical_crossentropy", optimizer=sgd, metrics=["accuracy"])

# Entrenamos el modelo y lo guardamos
PROCESO_ENTRENAMIENTO = modelo.fit(
    np.array(entrenar_x), np.array(entrenar_y), epochs=100, batch_size=5, verbose=1
)
modelo.save("modelo_asistente.h5", PROCESO_ENTRENAMIENTO)

from __future__ import absolute_import, division, print_function, unicode_literals

# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras

# Helper libraries
import numpy as np

class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
               'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']
TEST_MODEL_FILENAME = 'test_model.h5'

fashion_mnist = keras.datasets.fashion_mnist

(train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()

# preprocess
train_images = train_images / 255.0
test_images = test_images / 255.0

try:
    model = keras.models.load_model(TEST_MODEL_FILENAME)
    print('Loaded saved model')
except IOError:
    model = keras.Sequential([
        keras.layers.Flatten(input_shape=(28, 28)),
        keras.layers.Dense(128, activation=tf.nn.relu),
        keras.layers.Dense(10, activation=tf.nn.softmax)
    ])

    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    print('Saved model not found! Creating and compiling new model')

history = model.fit(train_images, train_labels, epochs=2)

# test_loss, test_acc = model.evaluate(test_images, test_labels)
# print('Test Accuracy:', test_acc)

# predictions = model.predict(test_images)
# print(predictions[0])

print(history.history)

model.save(TEST_MODEL_FILENAME)
print('Model saved to: ', TEST_MODEL_FILENAME)

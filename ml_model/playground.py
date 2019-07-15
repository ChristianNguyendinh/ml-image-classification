from __future__ import absolute_import, division, print_function, unicode_literals

import sys

# Helper libraries
import numpy as np

# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras
tf.enable_eager_execution()

TEST_MODEL_FILENAME = 'test_model.h5'
IMAGE_SIZE = 192
NUM_IMAGES = 9

# fashion_mnist = keras.datasets.fashion_mnist

# (train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()

label_mappings = { 'sana' : 0, 'nayeon' : 1, 'mina' : 2 }

image_labels = [ 0, 1, 2, 0, 1, 2, 0, 1, 2 ]

filenames = tf.io.gfile.listdir('images')
filenames.sort()

def preprocess(fname):
    img = tf.io.read_file('images/' + fname)
    img = tf.image.decode_jpeg(img, channels=3)
    # img = (tf.cast(img, tf.float32)/127.5) - 1
    img = tf.image.resize(img, [IMAGE_SIZE, IMAGE_SIZE])
    img /= 255.0
    
    # save image locally
    # img = tf.cast(img, tf.uint8)
    # resized_encoded_image = tf.image.encode_jpeg(img, quality=100)
    # new_image_name = 'resized/resized_' + fname
    # sess = tf.Session()

    # with open(new_image_name, 'wb+') as output_file, sess.as_default():
    #     output_file.write(resized_encoded_image.eval())

    return img

def change_range(image, label):
    return 2 * image - 1, label


path_ds = tf.data.Dataset.from_tensor_slices(filenames)
print(path_ds)
image_ds = path_ds.map(preprocess)
print(image_ds)
label_ds = tf.data.Dataset.from_tensor_slices(tf.cast(image_labels, tf.int64))
print(label_ds)
image_label_ds = tf.data.Dataset.zip((image_ds, label_ds))
print(image_label_ds)

ds = image_label_ds.shuffle(buffer_size=NUM_IMAGES)
ds = ds.repeat()
ds = ds.batch(NUM_IMAGES)
ds = ds.prefetch(buffer_size=NUM_IMAGES)
print(ds)

mobile_net = tf.keras.applications.MobileNetV2(
    input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3), include_top=False)
mobile_net.trainable = False
# help(keras_applications.mobilenet_v2.preprocess_input)

keras_ds = ds.map(change_range)
# The dataset may take a few seconds to start, as it fills its shuffle buffer.
image_batch, label_batch = next(iter(keras_ds))
feature_map_batch = mobile_net(image_batch)
print(feature_map_batch.shape)

model = tf.keras.Sequential([
    mobile_net,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(len(image_labels))])

logit_batch = model(image_batch).numpy()
print(logit_batch.shape)

model.compile(optimizer=tf.train.AdamOptimizer(),
              loss=tf.keras.losses.sparse_categorical_crossentropy,
              metrics=["accuracy"])

model.summary()

model.fit(ds, epochs=5, steps_per_epoch=9)

sys.exit()

# preprocess
# train_images = train_images / 255.0
# test_images = test_images / 255.0

try:
    model = keras.models.load_model(TEST_MODEL_FILENAME)
    print('Loaded saved model')
except IOError:
    model = keras.Sequential([
        # keras.layers.Flatten(input_shape=(500, 500)),
        # keras.layers.Dense(128, activation=tf.nn.relu),
        # keras.layers.Dense(3, activation=tf.nn.softmax)
        keras.layers.GlobalAveragePooling2D(),
        keras.layers.Dense(3)
    ])

    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    
    print('Saved model not found! Creating and compiling new model')

history = model.fit(ds, epochs=5, steps_per_epoch=NUM_IMAGES)

# test_loss, test_acc = model.evaluate(test_images, test_labels)
# print('Test Accuracy:', test_acc)

# predictions = model.predict(test_images)
# print(predictions[0])

print(history.history)

model.save(TEST_MODEL_FILENAME)
print('Model saved to: ', TEST_MODEL_FILENAME)

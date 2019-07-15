import sys

# Helper libraries
import numpy as np
import matplotlib.pyplot as plt

# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras
tf.compat.v1.enable_eager_execution()

IMAGE_SIZE = 192
NUM_IMAGES = 9
TRAINING_IMAGE_PATH = 'images/training/'

label_mappings = { 'sana' : 0, 'nayeon' : 1, 'mina' : 2 }

image_labels = [ 2, 2, 2, 1, 1, 1, 0, 0, 0 ]

filenames = tf.io.gfile.listdir(TRAINING_IMAGE_PATH)
filenames.sort()

print(filenames)


def preprocess(fname):
    img = tf.io.read_file(TRAINING_IMAGE_PATH + fname)
    img = tf.image.decode_jpeg(img, channels=3)
    # img = (tf.cast(img, tf.float32)/127.5) - 1
    img = tf.image.resize(img, [IMAGE_SIZE, IMAGE_SIZE])
    img /= 255.0

    return img

def save_image(n, img):
    saved_img = img * 255.0
    saved_img = tf.cast(saved_img, tf.uint8)
    resized_encoded_image = tf.image.encode_jpeg(saved_img, quality=100)
    new_image_name = 'resized/resized_' + str(n) + '.jpg'

    with open(new_image_name, 'wb+') as output_file:
        output_file.write(resized_encoded_image.numpy())

def show_image(image):
    plt.subplot(2, 2, n + 1)
    plt.imshow(image)
    plt.grid(False)
    plt.xticks([])
    plt.yticks([])
    plt.show()

def debug_images(image_dataset):
    num_debug_images = 9

    print('======= DUMPING IMAGE DATASET INFO =======')
    
    print(image_dataset)
    for n, i in enumerate(image_ds.take(num_debug_images)):
        save_image(n, i)
        # show_image(i)
    
    print('======= END OF DUMPING IMAGE DATASET INFO =======')


def change_range(image, label):
    return 2 * image - 1, label

path_ds = tf.data.Dataset.from_tensor_slices(filenames)
image_ds = path_ds.map(preprocess)
label_ds = tf.data.Dataset.from_tensor_slices(tf.cast(image_labels, tf.int64))
image_label_ds = tf.data.Dataset.zip((image_ds, label_ds))

# for sanity
# debug_images(image_ds)

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

model = tf.keras.Sequential([
    mobile_net,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(len(image_labels))])

model.compile(optimizer=tf.train.AdamOptimizer(),
              loss=tf.keras.losses.sparse_categorical_crossentropy,
              metrics=["accuracy"])

model.summary()

model.fit(ds, epochs=3, steps_per_epoch=3)

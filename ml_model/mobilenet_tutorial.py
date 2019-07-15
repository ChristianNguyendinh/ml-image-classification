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
TESTING_IMAGE_PATH = 'images/testing/'

label_mappings = { 0 : 'sana', 1 : 'nayeon', 2 : 'mina' }

image_labels = [ 2, 2, 2, 1, 1, 1, 0, 0, 0 ]

def prepend_local_path(path):
    def inner_prepend(file):
        return path + file
    return inner_prepend

def preprocess(fname):
    img = tf.io.read_file(fname)
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
    plt.subplot(2, 2, 1)
    plt.imshow(image)
    plt.grid(False)
    plt.xticks([])
    plt.yticks([])
    plt.show()

def debug_images(image_dataset):
    num_debug_images = 9

    print('======= DUMPING IMAGE DATASET INFO =======')
    
    print(image_dataset)
    for n, i in enumerate(image_dataset.take(num_debug_images)):
        # save_image(n, i)
        show_image(i)
    
    print('======= END OF DUMPING IMAGE DATASET INFO =======')


def change_range(image, label):
    return 2 * image - 1, label

training_filenames = tf.io.gfile.listdir(TRAINING_IMAGE_PATH)
training_filenames.sort()
training_filenames = list(map(prepend_local_path(TRAINING_IMAGE_PATH), training_filenames))

print(training_filenames)

path_ds = tf.data.Dataset.from_tensor_slices(training_filenames)
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
    tf.keras.layers.Dense(len(label_mappings))])

model.compile(optimizer=tf.compat.v1.train.AdamOptimizer(),
              loss=tf.keras.losses.sparse_categorical_crossentropy,
              metrics=["accuracy"])

model.summary()

model.fit(ds, epochs=3, steps_per_epoch=3)

testing_filenames = tf.io.gfile.listdir(TESTING_IMAGE_PATH)
testing_filenames.sort()
testing_filenames = list(map(prepend_local_path(TESTING_IMAGE_PATH), testing_filenames))

print(testing_filenames)

test_path_ds = tf.data.Dataset.from_tensor_slices(testing_filenames)
test_image_ds = test_path_ds.map(preprocess)

test_ds = test_image_ds.batch(len(testing_filenames))
test_ds = test_ds.prefetch(buffer_size=len(testing_filenames))
print(test_ds)

predictions = model.predict(test_ds)

for predict in predictions:
    print(predict)
    guess = np.argmax(predict)
    print('Predicting: ' + str(predict[guess]) + ', for ' + label_mappings[guess])

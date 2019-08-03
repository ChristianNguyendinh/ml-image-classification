import fs from 'fs';
import path from 'path';

const TRAINING_IMAGES_DIR = `${__dirname}/../../../public/images/training/`;
const TEMP_FILE_DIR = `${__dirname}/../../../public/images/training/temp/`;

export function removeTempFile(filename: string) {
    fs.unlinkSync(path.join(TEMP_FILE_DIR, filename));
}

export function saveImageToModel(filename: string, id: number) {
    const modelTrainingImagesDir = path.join(TRAINING_IMAGES_DIR, id.toString());
    const finalImagePath = path.join(modelTrainingImagesDir, `${filename}.jpg`);
    if (!fs.existsSync(modelTrainingImagesDir)) {
        console.log(`Creating Training Image Direction for ID: ${id}`);
        fs.mkdirSync(modelTrainingImagesDir, { recursive: true });
    }
    fs.renameSync(path.join(TEMP_FILE_DIR, filename), finalImagePath);
    return finalImagePath;
}

export function getModelImageURLPath(id: number) {
    return `/images/training/${id}`;
}

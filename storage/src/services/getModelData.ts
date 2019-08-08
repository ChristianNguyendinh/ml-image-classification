import fs from 'fs';
import util from 'util';
import path from 'path';

const MODEL_DATA_DIR = `${__dirname}/../../../public/model-data`;
const readFile = util.promisify(fs.readFile);

export function checkIfModelExists(id: number) {
    return fs.existsSync(path.join(MODEL_DATA_DIR, `${id.toString()}.json`));
}

function formatImagePaths(id: number, imagesArr: ImagesContainer) {
    for (let image of imagesArr) {
        image.path = `/images/training/${id}/${image.path}`;
    }
    return imagesArr;
}

export async function getModelData(id: number) {
    let rawModelData = await readFile(`${MODEL_DATA_DIR}/${id}.json`);
    let modelData: Model = JSON.parse(rawModelData.toString());
    modelData.images = modelData.images ? formatImagePaths(id, modelData.images) : [];
    return modelData;
};

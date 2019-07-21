import fs from 'fs';
import util from 'util';

const modelDataDir = `${__dirname}/../../../public/model-data`;
const readFile = util.promisify(fs.readFile);

function formatImagePaths(id: number, imagesArr: ImagesContainer) {
    for (let image of imagesArr) {
        image.path = `/images/training/${id}/${image.path}`;
    }
    return imagesArr;
}

export async function getModelData(id: number) {
    let rawModelData = await readFile(`${modelDataDir}/${id}.json`);
    let modelData: Model = JSON.parse(rawModelData.toString());
    modelData.images = formatImagePaths(id, modelData.images);
    return modelData;
};

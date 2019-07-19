import fs from 'fs';
import util from 'util';
const modelDataDir = `${__dirname}/../../../public/model-data`;
const readFile = util.promisify(fs.readFile);

interface Image {
    path: string,
    name: string,
    description: string
};

interface ImagesContainer extends Array<Image>{};

function formatImagePaths(id: number, imagesArr: ImagesContainer) {
    for (let image of imagesArr) {
        image.path = `/images/training/${id}/${image.path}`;
    }
    return imagesArr;
}

export default async (id: number) => {
    // todo define model interface
    let rawModelData = await readFile(`${modelDataDir}/${id}.json`);
    let modelData = JSON.parse(rawModelData.toString());
    modelData.images = formatImagePaths(id, modelData.images);
    return modelData;
};

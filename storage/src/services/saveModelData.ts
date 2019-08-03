import fs from 'fs';
import path from 'path';

const MODEL_DATA_DIR = `${__dirname}/../../../public/model-data`;

function parseIdFromFilename(filename: string) {
    return parseInt(filename.split('.')[0])
}

export function generateId() {
    let storedModelIds = fs.readdirSync(MODEL_DATA_DIR).map(v => parseIdFromFilename(v)).sort();
    let nextId = storedModelIds[storedModelIds.length - 1] + 1;

    return nextId;
}

export function saveModelData(id: number, data: Model) {
    fs.writeFileSync(path.join(MODEL_DATA_DIR, `${id.toString()}.json`), JSON.stringify(data));
}

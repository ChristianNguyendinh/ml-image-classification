import request from 'request-promise-native';
import { EXPOSED_STORAGE_URL, GET_FULL_MODEL_DATA_URL, GET_MODEL_IMAGES_URL } from '../constants';

// TODO: update with new api route after adding to storage
export async function getListModels() {
    const res1 = await getModelData(1);
    const res2 = await getModelData(2);
    return [ res1, res2 ];
}

export async function getModelData(id: number) {
    const requestBody = { id };
    const modelData = await sendStoragePOSTRequest(GET_FULL_MODEL_DATA_URL, requestBody);
    modelData.id = id;
    return modelData;
}

export async function getFormattedURLModelImages(id: number) {
    const modelImages = await getModelImages(id);
    for (let image of modelImages) {
        image.path = `${EXPOSED_STORAGE_URL}${image.path}`;
    }
    return modelImages;
}

export async function getModelImages(id: number) {
    const requestBody = { id };
    return await sendStoragePOSTRequest(GET_MODEL_IMAGES_URL, requestBody);
}

async function sendStoragePOSTRequest(uri: string, body: any) {
    return await request({
        method: 'POST',
        uri,
        json: true,
        body
    });
}

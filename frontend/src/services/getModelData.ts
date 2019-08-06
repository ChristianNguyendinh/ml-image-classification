import request from 'request-promise-native';

const STORAGE_BASE_URL = 'http://127.0.0.1:3001';
const GET_FULL_MODEL_DATA_URL = `${STORAGE_BASE_URL}/model/read/data`;
const GET_MODEL_IMAGES_URL = `${STORAGE_BASE_URL}/model/read/images`;


// TODO: update with new api route after adding to storage
export async function getListModels() {
    const res1 = await getModelData(1);
    const res2 = await getModelData(2);
    return [ res1, res2 ];
}

export async function getModelData(id: number) {
    const requestBody = { id };
    return await sendStoragePOSTRequest(GET_FULL_MODEL_DATA_URL, requestBody);
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

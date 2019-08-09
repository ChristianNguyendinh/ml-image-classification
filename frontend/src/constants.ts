const EXPOSED_STORAGE_URL = `http://127.0.0.1:3001`;
const STORAGE_BASE_URL = process.env.PRODUCTION == 'true' ? 'http://storage_app:3001' : EXPOSED_STORAGE_URL;
const GET_FULL_MODEL_DATA_URL = `${STORAGE_BASE_URL}/model/read/data`;
const GET_MODEL_IMAGES_URL = `${STORAGE_BASE_URL}/model/read/images`;

export {
    STORAGE_BASE_URL,
    GET_FULL_MODEL_DATA_URL,
    GET_MODEL_IMAGES_URL,
    EXPOSED_STORAGE_URL
};

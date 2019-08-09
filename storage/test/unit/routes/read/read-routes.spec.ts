import * as getModelDataDependency from '../../../../src/services/getModelData';
import readRoutes from '../../../../src/routes/read/read-routes';
import Koa from 'koa';
import supertest from 'supertest';
import sinon from 'sinon';
import { Server } from 'http';

describe('/model/read - Reading Data Routes', () => {
    let server: Server
    let request: supertest.SuperTest<supertest.Test>;
    let getModelDataStub: sinon.SinonStub<[number], Promise<Model>>;

    const VALID_ID = 3;
    const INVALID_ID = 'a';
    const UNKNOWN_ID = 5;
    const STATUS_CODE_400 = 400;
    const STATUS_CODE_200 = 200;
    const BAD_ID_RESPONSE_BODY = { error: 'Bad ID Provided' };

    async function sendGetRequest(url: string, responseCode: number) {
        return await request
            .get(url)
            .send()
            .expect(responseCode);
    }


    describe('/:id/data - GET', () => {
        const testModelData: Model = {
            name: 'Test Model',
            description: 'testing model',
            dateCreated: '2019-07-22 12: 14: 16 EST',
            lastModified: '2019-07-22 15: 30: 30 EST',
            numImages: '5',
            accuracy: '0.69',
            images: []
        };

        async function sendDataRequest(id: any, responseCode: number) {
            return await sendGetRequest(`/${id}/data`, responseCode);
        }

        beforeEach(() => {
            getModelDataStub = sinon.stub(getModelDataDependency, 'getModelData');
            getModelDataStub.withArgs(VALID_ID).returns(new Promise((res, rej) => {
                res(testModelData);
            }));
            getModelDataStub.withArgs(UNKNOWN_ID).throwsException();

            const app = new Koa();
            app.use(readRoutes);

            server = app.listen();
            request = supertest(server);
        });

        afterEach(() => {
            server.close();
            sinon.restore();
        });

        it('should 400 when id is not valid', async () => {
            await sendDataRequest(INVALID_ID, STATUS_CODE_400);
        });

        it('should 400 with unknown id', async () => {
            const res = await sendDataRequest(UNKNOWN_ID, STATUS_CODE_400);
            res.body.should.deep.equal(BAD_ID_RESPONSE_BODY);
        });

        it('should 200 and read valid model data given valid id', async () => {
            const res = await sendDataRequest(VALID_ID, STATUS_CODE_200);
            res.body.should.deep.equal(testModelData);
        });
    });

    describe('/:id/images - GET', () => {
        const testModelImages: Model = {
            name: '',
            description: '',
            dateCreated: '',
            lastModified: '',
            numImages: '',
            accuracy: '',
            images: [
                {
                    name: 'First Image',
                    path: '/test/nothere/testImage1.jpg',
                    description: 'first test image'
                },
                {
                    name: 'Second Image',
                    path: '/test/nothere/testImage2.jpg',
                    description: 'second test image'
                },
                {
                    name: 'Third Image',
                    path: '/test/nothere/testImage3.jpg',
                    description: 'third test image'
                }
            ]
        }

        async function sendImageRequest(id: any, responseCode: number) {
            return await sendGetRequest(`/${id}/images`, responseCode);
        }

        beforeEach(() => {
            getModelDataStub = sinon.stub(getModelDataDependency, 'getModelData');
            getModelDataStub.withArgs(VALID_ID).returns(new Promise((res, rej) => {
                res(testModelImages);
            }));
            getModelDataStub.withArgs(UNKNOWN_ID).throwsException();

            const app = new Koa();
            app.use(readRoutes);

            server = app.listen();
            request = supertest(server);
        });

        afterEach(() => {
            server.close();
            sinon.restore();
        });

        it('should 400 when id is not valid', async () => {
            await sendImageRequest(INVALID_ID, STATUS_CODE_400);
        });

        it('should 400 with unknown id', async () => {
            const res = await sendImageRequest(UNKNOWN_ID, STATUS_CODE_400);
            res.body.should.deep.equal(BAD_ID_RESPONSE_BODY);
        });

        it('should 200 and return a list of images given valid id', async () => {
            const res = await sendImageRequest(VALID_ID, STATUS_CODE_200);
            res.body.should.deep.equal(testModelImages.images);
        });
    });
});

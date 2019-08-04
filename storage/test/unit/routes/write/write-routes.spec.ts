import * as saveModelDataDependency from '../../../../src/services/saveModelData';
import * as getModelDataDependency from '../../../../src/services/getModelData';
import * as imageUtilDependency from '../../../../src/services/imageUtil';
import writeRoutes from '../../../../src/routes/write/write-routes';
import proxyquire from 'proxyquire';
import Koa from 'koa';
import supertest from 'supertest';
import sinon from 'sinon';
import { Server } from 'http';

describe('/model/write - Reading Data Routes', () => {
    let server: Server
    let request: supertest.SuperTest<supertest.Test>;

    describe('/new - POST', () => {
        let saveModelDataStub: sinon.SinonStub<[number, Model], void>;
        let generateIdStub: sinon.SinonStub<[], number>;

        const INVALID_TEST_MODEL: any = {
            name: 55,
            description: ['a'],
            dateCreated: '2019-07-22 12: 14: 16 EST',
            lastModified: '2019-07-22 15: 30: 30 EST',
            numImages: 10,
            accuracy: 0.69
        };
        const VALID_TEST_MODEL: any = {
            name: 'Test Model',
            description: 'testing model',
            dateCreated: '2019-08-01T21:34:22.050Z',
            lastModified: '2019-08-01T22:34:22.050Z',
            numImages: '5',
            accuracy: '0.69'
        };
        const REQUIRED_ATTRIBUTES = [
            'name',
            'description',
            'dateCreated',
            'lastModified',
            'numImages',
            'accuracy'
        ];
        const TEST_ID = 5;

        beforeEach(() => {
            generateIdStub = sinon.stub(saveModelDataDependency, 'generateId');
            generateIdStub.returns(TEST_ID);

            saveModelDataStub = sinon.stub(saveModelDataDependency, 'saveModelData');
            saveModelDataStub.returns();

            const app = new Koa();
            app.use(writeRoutes);

            server = app.listen();
            request = supertest(server);
        });

        afterEach(() => {
            server.close();
            sinon.restore();
        });

        it('should 400 when required property is missing', async () => {
            let requestModel: any = {};
            Object.assign(requestModel, VALID_TEST_MODEL);

            for (let attr of REQUIRED_ATTRIBUTES) {
                delete requestModel[attr];
                await request
                    .post('/new')
                    .send({ data: requestModel })
                    .expect(400);
                requestModel[attr] = VALID_TEST_MODEL[attr];
            }
        });

        it('should 400 when required properties are of the wrong type', async () => {
            let requestModel: any = {};
            Object.assign(requestModel, VALID_TEST_MODEL);

            for (let attr of REQUIRED_ATTRIBUTES) {
                requestModel[attr] = INVALID_TEST_MODEL[attr];
                await request
                    .post('/new')
                    .send({ data: requestModel })
                    .expect(400);
                requestModel[attr] = VALID_TEST_MODEL[attr];
            }
        });

        it('should return a new ID if everything is valid', async () => {
            const res = await request
                .post('/new')
                .send({ data: VALID_TEST_MODEL })
                .expect(200);
            
            res.body.should.deep.equal({ id: TEST_ID });
        });
    });

    describe('/:id/image - POST', () => {
        const HTTP_MIMETYPES = {
            imageJpg: 'image/jpeg',
            imagePng: 'image/png',
            multipartFormData: 'multipart/form-data',
            textHtml: 'text/html'
        }
        const TEST_FILENAME = 'testFile';
        const VALID_ID = 101;
        const INVALID_ID = 100;

        let checkIfModelExistsStub: sinon.SinonStub<[number], boolean>;;
        let removeTempFileStub: sinon.SinonStub<[string], void>;;
        let saveImageToModelStub: sinon.SinonStub<[string, number], string>;;
        let koaMulterStub: sinon.SinonStub<[any], any>;
        let stubbedWriteRoutes;
        let testFileContext = {};

        function setTestFileContext(mimetype: string) {
            testFileContext = { pic: [{ TEST_FILENAME, mimetype }] };
        }

        function resetTestFileContext() {
            testFileContext = {};
        }

        beforeEach(() => {
            checkIfModelExistsStub = sinon.stub(getModelDataDependency, 'checkIfModelExists');
            checkIfModelExistsStub.withArgs(VALID_ID).returns(true);
            checkIfModelExistsStub.withArgs(INVALID_ID).returns(false);

            removeTempFileStub = sinon.stub(imageUtilDependency, 'removeTempFile');
            saveImageToModelStub = sinon.stub(imageUtilDependency, 'saveImageToModel');

            koaMulterStub = sinon.stub();
            koaMulterStub.returns({
                fields: () => {
                    return (async (ctx: any, next: any) => {
                        ctx.req.files = testFileContext;
                        await next();
                    });
                }
            });

            stubbedWriteRoutes = proxyquire('../../../../src/routes/write/write-routes', {
                'koa-multer': koaMulterStub
            });
            
            const app = new Koa();
            app.use(stubbedWriteRoutes.default);

            server = app.listen();
            request = supertest(server);
        });

        it('should 400 given an improper header content-type', async () => {
            setTestFileContext(HTTP_MIMETYPES.imageJpg);
            await request
                .post(`/${VALID_ID}/image`)
                .set('content-type', HTTP_MIMETYPES.textHtml)
                .send()
                .expect(400);
        });

        it('should 400 given an improper mimetype', async () => {
            setTestFileContext(HTTP_MIMETYPES.imagePng);
            await request
                .post(`/${VALID_ID}/image`)
                .set('content-type', HTTP_MIMETYPES.multipartFormData)
                .send()
                .expect(400);

            removeTempFileStub.callCount.should.equal(1);
            saveImageToModelStub.callCount.should.equal(0);
        });

        it('should 400 given an improper ID', async () => {
            setTestFileContext(HTTP_MIMETYPES.imageJpg);
            await request
                .post(`/${INVALID_ID}/image`)
                .set('content-type', HTTP_MIMETYPES.multipartFormData)
                .send()
                .expect(400);

            removeTempFileStub.callCount.should.equal(1);
            saveImageToModelStub.callCount.should.equal(0);
        });

        it('should succeed when given proper input', async () => {
            setTestFileContext(HTTP_MIMETYPES.imageJpg);
            const res = await request
                .post(`/${VALID_ID}/image`)
                .set('content-type', HTTP_MIMETYPES.multipartFormData)
                .send()
                .expect(200);

            res.body.should.have.property('success', true);
            removeTempFileStub.callCount.should.equal(0);
            saveImageToModelStub.callCount.should.equal(1);
        });

        afterEach(() => {
            server.close();
            sinon.restore();
            resetTestFileContext();
        });
    });
});

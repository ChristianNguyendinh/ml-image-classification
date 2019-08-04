import * as saveModelDataDependency from '../../../../src/services/saveModelData';
import * as imageUtilDependency from '../../../../src/services/imageUtil';
import writeRoutes from '../../../../src/routes/write/write-routes';
import koaMulter from 'koa-multer';
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
        let koaMulterStub;
        let koaMulterFilterStub;
        let stubbedWriteRoutes;

        beforeEach(() => {
            koaMulterStub = sinon.stub();
            koaMulterStub.returns({
                fields: () => {
                    return (async (ctx: any, next: any) => {
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

        it('should asdf', async () => {
            const res = await request
                .post('/1/image')
                .set('content-type', 'multipart/form-data')
                .send()
                .expect(400);
        });

        afterEach(() => {
            server.close();
            sinon.restore();
        });
    });
});

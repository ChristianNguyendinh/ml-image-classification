import * as getModelDataDependency from '../../../src/services/getModelData';
import readRoutes from '../../../src/routes/read/read-routes';
import Koa from 'koa';
import supertest from 'supertest';
import sinon from 'sinon';
import { Server } from 'http';

describe('/model/read - Reading Data Routes', () => {
    describe('/data - POST', () => {
        let server: Server
        let request: supertest.SuperTest<supertest.Test>;
        // TODO: appropriate type
        let getModelDataStub;

        const validId = 3;
        const invalidId = 5;
        const testModel: Model = {
            name: 'Test Model',
            description: 'testing model',
            dateCreated: '2019-07-22 12: 14: 16 EST',
            lastModified: '2019-07-22 15: 30: 30 EST',
            numImages: '5',
            accuracy: '0.69',
            images: []
        };

        beforeEach(() => {
            getModelDataStub = sinon.stub(getModelDataDependency, 'getModelData');
            getModelDataStub.withArgs(validId).returns(new Promise((res, rej) => {
                res(testModel);
            }));
            getModelDataStub.withArgs(invalidId).throwsException();

            const app = new Koa();
            app.use(readRoutes);

            server = app.listen();
            request = supertest(server);
        });

        afterEach(() => {
            server.close();
            sinon.restore();
        });

        it('should 400 when id not provided', async () => {
            await request
                .post('/data')
                .send({})
                .expect(400);
        });

        it('should 400 when id is not valid', async () => {
            await request
                .post('/data')
                .send({id: -1})
                .expect(400);
        });

        it('should fail with unknown id', async () => {
            const res = await request
                .post('/data')
                .send({ id: invalidId })
                .expect(400);

            res.body.should.deep.equal({ error: 'Bad ID Provided' });
        });

        it('should 200 and read valid model data given valid id', async () => {
            const res = await request
                .post('/data')
                .send({ id: validId })
                .expect(200);

            res.body.should.deep.equal(testModel);
        });

        
    });
});

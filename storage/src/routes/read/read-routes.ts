import { Context } from 'koa';
import joiRouter from 'koa-joi-router';
import { getModelData } from '../../services/getModelData';

const Joi = joiRouter.Joi;
const routes = joiRouter();

const readSchema = {
    id: Joi.number().min(0).required()
};

// these should really just have a url parameter and be a GET...
routes.route({
    method: 'post',
    path: '/data',
    validate: {
        body: readSchema,
        type: 'json'
    },
    handler: async (ctx: Context) => {
        const id = ctx.request.body.id;
        try {
            ctx.response.body = await getModelData(id);
        } catch(err) {
            console.log(err);
            ctx.response.status = 400;
            ctx.response.body = { error: 'Bad ID Provided' };
        }
    }
});

// TODO: test
routes.route({
    method: 'post',
    path: '/images',
    validate: {
        body: readSchema,
        type: 'json'
    },
    handler: async (ctx: Context) => {
        const id = ctx.request.body.id;
        try {
            const modelData = await getModelData(id);
            ctx.response.body = modelData.images;
        } catch (err) {
            console.log(err);
            ctx.response.status = 400;
            ctx.response.body = { error: 'Bad ID Provided' };
        }
    }
});

export default routes.middleware();

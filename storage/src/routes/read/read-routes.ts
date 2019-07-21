import { Context } from 'koa';
import joiRouter from 'koa-joi-router';
import { getModelData } from '../../services/getModelData';

const Joi = joiRouter.Joi;
const routes = joiRouter();

const readSchema = {
    id: Joi.number().min(0).required()
};

routes.route({
    method: 'post',
    path: '/data',
    validate: {
        body: readSchema,
        type: 'json'
    },
    handler: async (ctx: Context) => {
        const id = ctx.request.body.id;
        ctx.response.body = await getModelData(id);
    }
});

export default routes.middleware();

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
        try {
            ctx.response.body = await getModelData(id);
        } catch(err) {
            ctx.response.status = 400;
            ctx.response.body = { error: 'Bad ID Provided' };
        }
    }
});

export default routes.middleware();
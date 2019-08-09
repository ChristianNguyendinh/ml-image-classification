import { Context } from 'koa';
import joiRouter from 'koa-joi-router';
import { getModelData } from '../../services/getModelData';

const Joi = joiRouter.Joi;
const routes = joiRouter();

const idParamSchema = Joi.object().keys({
    id: Joi.number().min(0).required()
});

routes.route({
    method: 'get',
    path: '/:id/data',
    validate: {
        params: idParamSchema
    },
    handler: async (ctx: Context) => {
        try {
            ctx.response.body = await getModelData(ctx.params.id);
        } catch(err) {
            handleGetModelDataError(ctx, err);
        }
    }
});

routes.route({
    method: 'get',
    path: '/:id/images',
    validate: {
        params: idParamSchema,
    },
    handler: async (ctx: Context) => {
        try {
            const modelData = await getModelData(ctx.params.id);
            ctx.response.body = modelData.images;
        } catch (err) {
            handleGetModelDataError(ctx, err);
        }
    }
});

function handleGetModelDataError(ctx: Context, err: any) {
    console.log(err);
    ctx.response.status = 400;
    ctx.response.body = { error: 'Bad ID Provided' };
}

export default routes.middleware();

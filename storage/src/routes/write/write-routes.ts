import { Context } from 'koa';
import joiRouter from 'koa-joi-router'; 
import { generateId, saveModelData } from '../../services/saveModelData';

const Joi = joiRouter.Joi;
const routes = joiRouter();

const newModelSchema = {
    data: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        dateCreated: Joi.string().isoDate().required(),
        lastModified: Joi.string().isoDate().required(),
        numImages: Joi.string().required(),
        accuracy: Joi.string().required()
    }).required()
};

routes.route({
    method: 'post',
    path: '/new',
    validate: {
        body: newModelSchema,
        type: 'json'
    },
    handler: async (ctx: Context) => {
        let newId = generateId();
        saveModelData(newId, ctx.request.body.data);
        ctx.response.body = { id: newId };
    }
});

export default routes.middleware();

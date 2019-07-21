import { Context } from 'koa';
import joiRouter from 'koa-joi-router';

const Joi = joiRouter.Joi;
const routes = joiRouter();

const newModelSchema = {
    name: Joi.string().required(),
    description: Joi.string().required(),
    dateCreated: Joi.string().required(),
    lastModified: Joi.string().required(),
    numImages: Joi.string().required(),
    accuracy: Joi.string().required(),
    images: Joi.array().items(Joi.object({
        path: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().required()
    })).required()
};

routes.route({
    method: 'post',
    path: '/new',
    validate: {
        body: newModelSchema,
        type: 'json'
    },
    handler: async (ctx: Context) => {
        // if file already exists, reject with error
        // generate id
        // create new file with json properties
        // write to file with properties
        // new folder for image insertion if any (reuse from image route)
        // return id
    }
});

const updateModelSchema = {
    id: Joi.number().min(0).required(),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    dateCreated: Joi.string().optional(),
    lastModified: Joi.string().optional(),
    numImages: Joi.string().optional(),
    accuracy: Joi.string().optional(),
    images: Joi.array().items(Joi.object({
        path: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().required()
    })).optional()
};

routes.route({
    method: 'post',
    path: '/update',
    validate: {
        body: updateModelSchema,
        type: 'json'
    },
    handler: async (ctx: Context) => {
        // if file doesn't exist, reject with error
        // reuse the write and image insertion from /new
    }
});

export default routes.middleware();

import { Context } from 'koa';
import joiRouter from 'koa-joi-router'; 
import { checkIfModelExists } from '../../services/getModelData'
import { generateId, saveModelData } from '../../services/saveModelData';
import { removeTempFile, saveImageToModel, getModelImageURLPath } from '../../services/imageUtil'
import multer from 'koa-multer';

const Joi = joiRouter.Joi;
const routes: any = joiRouter();
const upload = multer({ dest: `${__dirname}/../../../../public/images/training/temp` })

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

const imageRouteHander = async (ctx: any) => {
    console.log(ctx.request);
    console.log(ctx.req.files);

    let imageInfo = ctx.req.files.pic[0];
    if (imageInfo.mimetype != 'image/jpeg') {
        removeTempFile(imageInfo.filename);
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: 'only accepted file type is JPEG' };
    } else if (!ctx.params.id || !checkIfModelExists(ctx.params.id)) {
        removeTempFile(imageInfo.filename);
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: 'bad ID provided' };
    } else {
        saveImageToModel(imageInfo.filename, ctx.params.id);
        ctx.response.body = {
            success: true,
            path: `${getModelImageURLPath(ctx.params.id)}/${imageInfo.filename}.jpg`
        };
    }
};

const handleImageUploadError = async (ctx: any, next: any) => {
    try {
        console.log(upload);
        await next();
    } catch(err) {
        console.log(err);
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: 'bad image uploaded' };
    }
}

const imageUploadHeaderSchema = Joi.object({
    'content-type': Joi.string().regex(/^multipart\/form-data.*$/).required()
}).unknown();

routes.route({
    method: 'post',
    path: '/:id/image',
    validate: {
        header: imageUploadHeaderSchema,
    },
    handler: [ handleImageUploadError, upload.fields([{ name: 'pic' }]), imageRouteHander]
});

export default routes.middleware();

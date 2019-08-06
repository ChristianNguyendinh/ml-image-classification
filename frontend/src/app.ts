import Koa from 'koa';
import KoaRouter from 'koa-router'
import render from 'koa-ejs';
import serve from 'koa-static'
import { getListModels, getModelData, getModelImages } from './services/getModelData';

const app = new Koa();
const router = new KoaRouter();

app.use(serve(`${__dirname}/static`));

render(app, {
    root: `${__dirname}/views`,
    layout: false,
    viewExt: 'ejs'
});

app.use(async (ctx, next) => {
    try {
        console.log("Request Received")
        await next();
    } catch (err) {
        ctx.status = 500;
        console.error('Uncaught Error: ', err);
    }
});

router.get('/model/list', async (ctx, next) => {
    await ctx.render('model-list', {
        models: await getListModels()
    });
});

router.get('/model/:modelId/details', async (ctx, next) => {
    const modelId: number = parseInt(ctx.params.modelId);
    await ctx.render('model-details', {
        model: await getModelData(modelId)
    });
});

router.get('/model/:modelId/images', async (ctx, next) => {
    const modelId: number = parseInt(ctx.params.modelId);
    await ctx.render('model-images', {
        images: await getModelImages(modelId)
    });
});

router.get('/model/:modelId/train', async (ctx, next) => {
    const modelId: number = parseInt(ctx.params.modelId);
    await ctx.render('model-train', {
        model: await getModelData(modelId)
    });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
console.log("App listening at port 3000");

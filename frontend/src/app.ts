import Koa from 'koa';
import KoaRouter from 'koa-router'
import render from 'koa-ejs';

const app = new Koa();
const router = new KoaRouter();

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

router.get('/', async (ctx, next) => {
    await ctx.render('main', {
        testAttr: 'Saito Asuka'
    });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
console.log("App listening at port 3000");

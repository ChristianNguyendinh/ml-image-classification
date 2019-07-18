import Koa from 'koa';
import KoaRouter from 'koa-router'
import render from 'koa-ejs';
import serve from 'koa-static'

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

router.get('/', async (ctx, next) => {
    await ctx.render('model-list', {
        models: [
            { name: 'Twice Top 3 Model', description: 'Sana, Mina, Nayeon recognition model', dateCreated: '2019-05-14 12:14:16 EST' },
            { name: 'Random Model', description: 'Some random palceholder model', dateCreated: '2000-02-02 10:30:00 EST' }
        ]
    });
});

router.get('/images', async (ctx, next) => {
    await ctx.render('images', {
        images: [ 
            { path: '/img/sana_1.jpg', name: 'sana', description: 'desc' },
            { path: '/img/sana_2.jpg', name: 'sana', description: 'desc' },
            { path: '/img/sana_3.jpg', name: 'sana', description: 'desc' },
            { path: '/img/mina_1.jpg', name: 'mina', description: 'desc' },
            { path: '/img/mina_2.jpg', name: 'mina', description: 'desc' },
            { path: '/img/mina_3.jpg', name: 'mina', description: 'desc' },
            { path: '/img/nayeon_1.jpg', name: 'nayeon', description: 'desc' },
            { path: '/img/nayeon_2.jpg', name: 'nayeon', description: 'desc' },
            { path: '/img/nayeon_3.jpg', name: 'nayeon', description: 'desc' },
        ]
    });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
console.log("App listening at port 3000");

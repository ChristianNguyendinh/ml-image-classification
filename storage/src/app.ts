import Koa from 'koa';
import serve from 'koa-static';
import routes from './routes/main-routes';

const app = new Koa();
const rootDir = `${__dirname}/../../`;

app.use(serve(`${rootDir}/public/`));

app.use(routes.routes())
app.use(routes.allowedMethods())

app.listen(3001)
console.log("Storage app listening on port 3001");

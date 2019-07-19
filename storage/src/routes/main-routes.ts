import KoaRouter from 'koa-router';
import readRoutes from './read/read-routes'

const router = new KoaRouter();

router.use('/model', readRoutes);

export default router;

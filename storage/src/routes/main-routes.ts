import KoaRouter from 'koa-router';
import readRoutes from './read/read-routes'

const router = new KoaRouter();

router.use('/model/read', readRoutes);

// router.use('/model/write', writeRoutes);

export default router;

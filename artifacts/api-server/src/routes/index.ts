import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import contentRouter from "./content";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(contentRouter);

export default router;

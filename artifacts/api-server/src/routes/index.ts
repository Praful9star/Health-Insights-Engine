import { Router, type IRouter } from "express";
import healthRouter from "./health";
import claimCheckerRouter from "./claim-checker";
import diseaseJourneyRouter from "./disease-journey";
import reportExplainerRouter from "./report-explainer";

const router: IRouter = Router();

router.use(healthRouter);
router.use(claimCheckerRouter);
router.use(diseaseJourneyRouter);
router.use(reportExplainerRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import claimCheckerRouter from "./claim-checker";
import diseaseJourneyRouter from "./disease-journey";
import reportExplainerRouter from "./report-explainer";
import symptomCheckerRouter from "./symptom-checker";

const router: IRouter = Router();

router.use(healthRouter);
router.use(claimCheckerRouter);
router.use(diseaseJourneyRouter);
router.use(reportExplainerRouter);
router.use(symptomCheckerRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import claimCheckerRouter from "./claim-checker";
import diseaseJourneyRouter from "./disease-journey";
import reportExplainerRouter from "./report-explainer";
import ocrReportRouter from "./ocr-report";
import symptomCheckerRouter from "./symptom-checker";
import medicineExplainerRouter from "./medicine-explainer";

const router: IRouter = Router();

router.use(healthRouter);
router.use(claimCheckerRouter);
router.use(diseaseJourneyRouter);
router.use(reportExplainerRouter);
router.use(ocrReportRouter);
router.use(symptomCheckerRouter);
router.use(medicineExplainerRouter);

export default router;

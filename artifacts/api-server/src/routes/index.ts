import { Router, type IRouter } from "express";
import healthRouter from "./health";
import claimCheckerRouter from "./claim-checker";
import diseaseJourneyRouter from "./disease-journey";
import reportExplainerRouter from "./report-explainer";
import ocrReportRouter from "./ocr-report";
import symptomCheckerRouter from "./symptom-checker";
import medicineExplainerRouter from "./medicine-explainer";
import healthNewsRouter from "./health-news";
import drugInteractionRouter from "./drug-interaction";
import doctorPrepRouter from "./doctor-prep";
import profileRouter from "./profile";
import notificationsRouter from "./notifications";
import paymentsRouter from "./payments";
import feedbackRouter from "./feedback";
import vaultRouter from "./vault";
import entitlementRouter from "./entitlement";

const router: IRouter = Router();

router.use(healthRouter);
router.use(claimCheckerRouter);
router.use(diseaseJourneyRouter);
router.use(reportExplainerRouter);
router.use(ocrReportRouter);
router.use(symptomCheckerRouter);
router.use(medicineExplainerRouter);
router.use(healthNewsRouter);
router.use(drugInteractionRouter);
router.use(doctorPrepRouter);
router.use(profileRouter);
router.use(notificationsRouter);
router.use(paymentsRouter);
router.use(feedbackRouter);
router.use(vaultRouter);
router.use(entitlementRouter);

export default router;

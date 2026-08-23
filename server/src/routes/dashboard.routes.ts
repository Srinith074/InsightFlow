import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/:datasetId", authMiddleware, getDashboard);
router.get("/:datasetId/sheet/:sheetName", authMiddleware, getDashboard);

export default router;
import { Router } from "express";
import {
  createReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
} from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createReport);
router.get("/", authMiddleware, getReports);
router.get("/:id", authMiddleware, getReportById);
router.get("/:id/download", authMiddleware, downloadReport);
router.delete("/:id", authMiddleware, deleteReport);

export default router;

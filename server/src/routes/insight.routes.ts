import { Router } from "express";
import {
  createInsight,
  getInsights,
  getInsightById,
  updateInsight,
  deleteInsight,
} from "../controllers/insight.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createInsight);
router.get("/", authMiddleware, getInsights);
router.get("/:id", authMiddleware, getInsightById);
router.patch("/:id", authMiddleware, updateInsight);
router.delete("/:id", authMiddleware, deleteInsight);

export default router;

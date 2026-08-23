import path from "path";
import { Router } from "express";
import multer from "multer";

import {
  uploadDataset,
  getDatasets,
  getDatasetPreview,
  getDatasetSchema,
  deleteDataset,
} from "../controllers/dataset.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      [".csv", ".xls", ".xlsx"].includes(ext) ||
      file.mimetype.includes("csv") ||
      file.mimetype.includes("excel") ||
      file.mimetype.includes("spreadsheetml")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, XLS, and XLSX files are allowed"));
    }
  },
});

// Upload Dataset
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "file", maxCount: 1 }, { name: "files", maxCount: 1 }]),
  uploadDataset
);

// Get All User Datasets
router.get(
  "/",
  authMiddleware,
  getDatasets
);

// Get Dataset Schema & Data Quality
router.get(
  "/:id/schema",
  authMiddleware,
  getDatasetSchema
);

// Get Dataset Preview (Paginated)
router.get(
  "/:id/preview",
  authMiddleware,
  getDatasetPreview
);

// Delete Dataset
router.delete(
  "/:id",
  authMiddleware,
  deleteDataset
);

export default router;
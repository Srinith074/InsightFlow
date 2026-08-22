import { Router } from "express";
import multer from "multer";

import {
  uploadDataset,
  getDatasets,
  deleteDataset,
} from "../controllers/dataset.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

const upload = multer({
  dest: "uploads/",
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

// Delete Dataset
router.delete(
  "/:id",
  authMiddleware,
  deleteDataset
);

export default router;
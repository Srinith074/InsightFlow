import type { Response } from "express";
import fs from "fs";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import Dataset from "../models/Dataset.js";
import {
  createDataset,
  getUserDatasets,
} from "../services/dataset.service.js";
import {
  uploadFileToStorage,
  deleteFileFromStorage,
} from "../services/storage.service.js";
import type { RequestWithUser } from "../types/index.js";

export async function uploadDataset(
  req: RequestWithUser,
  res: Response
) {
  let file = req.file;
  if (!file && req.files) {
    if (Array.isArray(req.files)) {
      file = req.files[0];
    } else {
      file = req.files["file"]?.[0] || req.files["files"]?.[0];
    }
  }
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (!file) {
    return res.status(400).json({
      message: "Please provide a CSV or Excel file",
    });
  }

  try {
    const buffer = file.buffer || (file.path && fs.existsSync(file.path) ? fs.readFileSync(file.path) : null);

    if (!buffer) {
      return res.status(400).json({
        message: "Unable to read uploaded file data",
      });
    }

    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });

    const sheetNames = workbook.SheetNames || [];
    const firstSheet = sheetNames[0] || "";

    let rowCount = 0;
    let columnCount = 0;
    let headers: string[] = [];

    if (firstSheet && workbook.Sheets[firstSheet]) {
      const worksheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        defval: "",
      });

      if (rows.length > 0 && Array.isArray(rows[0])) {
        headers = rows[0].map((v) => String(v).trim()).filter(Boolean);
        rowCount = Math.max(0, rows.length - 1);
        columnCount = headers.length;
      }
    }

    // Upload to durable object storage (MongoDB GridFS / S3 / Cloudinary)
    const storageResult = await uploadFileToStorage(
      buffer,
      file.originalname,
      file.mimetype
    );

    let dataset;
    try {
      dataset = await createDataset({
        owner: user.id,
        name: file.originalname,
        fileName: file.filename || file.originalname,
        mimeType: file.mimetype,
        size: storageResult.size || file.size,
        rowCount,
        columnCount,
        headers,
        storageKey: storageResult.storageKey,
        storageProvider: storageResult.storageProvider,
        storageUrl: storageResult.storageUrl,
        path: "",
        sheetNames,
        selectedSheet: firstSheet,
      });
    } catch (dbError) {
      // Clean up storage artifact if database record creation fails
      await deleteFileFromStorage({
        storageKey: storageResult.storageKey,
        storageProvider: storageResult.storageProvider,
      });
      throw dbError;
    }

    return res.json({
      dataset: {
        id: dataset._id.toString(),
        name: dataset.name,
        fileName: dataset.fileName,
        mimeType: dataset.mimeType,
        size: dataset.size,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        headers: dataset.headers,
        sheetNames: dataset.sheetNames,
        selectedSheet: dataset.selectedSheet,
        storageKey: dataset.storageKey,
        storageProvider: dataset.storageProvider,
        storageUrl: dataset.storageUrl,
        createdAt: dataset.createdAt,
        updatedAt: dataset.updatedAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Failed to parse and store dataset",
    });
  }
}

export async function getDatasets(
  req: RequestWithUser,
  res: Response
) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const datasets = await getUserDatasets(user.id);

  return res.json({
    datasets: datasets.map((dataset) => ({
      id: dataset._id.toString(),
      name: dataset.name,
      fileName: dataset.fileName,
      mimeType: dataset.mimeType,
      size: dataset.size,
      rowCount: dataset.rowCount,
      columnCount: dataset.columnCount,
      headers: dataset.headers,
      sheetNames: dataset.sheetNames,
      selectedSheet: dataset.selectedSheet,
      storageKey: dataset.storageKey,
      storageProvider: dataset.storageProvider,
      storageUrl: dataset.storageUrl,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
    })),
  });
}

export async function deleteDataset(
  req: RequestWithUser,
  res: Response
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid dataset ID",
      });
    }

    const dataset = await Dataset.findById(id);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    if (String(dataset.owner) !== user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Delete from durable object storage (and local disk if legacy)
    await deleteFileFromStorage(dataset);

    await dataset.deleteOne();

    return res.json({
      success: true,
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    console.error("Delete dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete dataset",
    });
  }
}
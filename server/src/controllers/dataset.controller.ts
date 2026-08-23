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
  getFileBufferFromStorage,
} from "../services/storage.service.js";
import { detectDatasetSchema } from "../services/schema.service.js";
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

export async function getDatasetPreview(
  req: RequestWithUser,
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid dataset ID" });
    }

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    if (String(dataset.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const buffer = await getFileBufferFromStorage(dataset);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const availableSheets = workbook.SheetNames || [];

    const sheetNameQuery = req.query.sheetName ? decodeURIComponent(String(req.query.sheetName)) : "";
    const requestedSheet = sheetNameQuery && workbook.Sheets[sheetNameQuery]
      ? sheetNameQuery
      : availableSheets[0] || "";

    if (!requestedSheet || !workbook.Sheets[requestedSheet]) {
      return res.json({
        rows: [],
        totalRows: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        headers: [],
        sheetName: "",
        availableSheets,
      });
    }

    const sheet = workbook.Sheets[requestedSheet];
    const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const headers = Object.keys(allRows[0] || {});

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(String(req.query.limit || "50"), 10) || 50));
    const totalRows = allRows.length;
    const totalPages = Math.ceil(totalRows / limit);
    const start = (page - 1) * limit;
    const rows = allRows.slice(start, start + limit);

    return res.json({
      rows,
      totalRows,
      page,
      limit,
      totalPages,
      headers,
      sheetName: requestedSheet,
      availableSheets,
    });
  } catch (error) {
    console.error("Preview error:", error);
    return res.status(500).json({ message: "Failed to load dataset preview" });
  }
}

export async function getDatasetSchema(
  req: RequestWithUser,
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid dataset ID" });
    }

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    if (String(dataset.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const buffer = await getFileBufferFromStorage(dataset);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const availableSheets = workbook.SheetNames || [];

    const sheetNameQuery = req.query.sheetName ? decodeURIComponent(String(req.query.sheetName)) : "";
    const requestedSheet = sheetNameQuery && workbook.Sheets[sheetNameQuery]
      ? sheetNameQuery
      : availableSheets[0] || "";

    if (!requestedSheet || !workbook.Sheets[requestedSheet]) {
      return res.status(404).json({ message: "Sheet not found", availableSheets });
    }

    const sheet = workbook.Sheets[requestedSheet];
    const allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const schemaResult = detectDatasetSchema(allRows);

    return res.json({
      schema: schemaResult,
      sheetName: requestedSheet,
      availableSheets,
      dataset: {
        id: dataset._id.toString(),
        name: dataset.name,
        fileName: dataset.fileName,
        size: dataset.size,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        createdAt: dataset.createdAt,
      },
    });
  } catch (error) {
    console.error("Schema detection error:", error);
    return res.status(500).json({ message: "Failed to detect dataset schema" });
  }
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
import type { Response } from "express";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import Dataset from "../models/Dataset.js";
import { calculateDashboard } from "../services/analytics.service.js";
import { getFileBufferFromStorage } from "../services/storage.service.js";
import type { RequestWithUser } from "../types/index.js";

export async function getDashboard(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { datasetId, sheetName } = req.params;

    if (!datasetId || !mongoose.isValidObjectId(datasetId)) {
      return res.status(400).json({
        message: "Invalid dataset ID",
      });
    }

    const dataset = await Dataset.findById(datasetId);

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

    let buffer: Buffer;
    try {
      buffer = await getFileBufferFromStorage(dataset);
    } catch (storageErr) {
      return res.status(404).json({
        message:
          storageErr instanceof Error
            ? storageErr.message
            : "Dataset file not found in storage. Please re-upload the dataset.",
      });
    }

    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });

    const availableSheets = workbook.SheetNames || [];

    if (availableSheets.length === 0) {
      return res.json({
        totalRows: 0,
        totalRevenue: 0,
        averageRevenue: 0,
        topProduct: "N/A",
        topProductSales: 0,
        productSales: {},
        monthlyRevenue: [],
        sheetName: "",
        availableSheets: [],
      });
    }

    const requestedSheet = sheetName ? decodeURIComponent(sheetName) : availableSheets[0];

    if (!workbook.Sheets[requestedSheet]) {
      return res.status(404).json({
        message: `Sheet "${requestedSheet}" not found`,
        availableSheets,
      });
    }

    const sheet = workbook.Sheets[requestedSheet];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const dashboard = calculateDashboard(rows);

    return res.json({
      ...dashboard,
      sheetName: requestedSheet,
      availableSheets,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      message: "Failed to generate dashboard",
    });
  }
}
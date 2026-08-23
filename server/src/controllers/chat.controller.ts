import type { Response } from "express";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import Dataset from "../models/Dataset.js";
import { calculateDashboard } from "../services/analytics.service.js";
import { compareRevenue } from "../services/excel/compare.js";
import { productionByMonth } from "../services/excel/production.js";
import { revenueByMonth, revenueStats } from "../services/excel/revenue.js";
import { totalSales } from "../services/excel/sales.js";
import { extractIntent } from "../services/gemini/intent.js";
import { generateResponse } from "../services/gemini/response.js";
import { getFileBufferFromStorage } from "../services/storage.service.js";
import type { RequestWithUser } from "../types/index.js";

export async function chat(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { datasetId, sheetName, message } = req.body as {
      datasetId?: string;
      sheetName?: string;
      message?: string;
    };

    if (!datasetId || !message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Dataset ID and message are required",
      });
    }

    if (!mongoose.isValidObjectId(datasetId)) {
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
      return res.status(400).json({
        message: "Workbook contains no sheets",
      });
    }

    const selectedSheetName = sheetName ? String(sheetName).trim() : availableSheets[0];
    const sheet = workbook.Sheets[selectedSheetName];

    if (!sheet) {
      return res.status(404).json({
        message: `Sheet "${selectedSheetName}" not found`,
        availableSheets,
      });
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    // ----------------------------------------------------
    // Step 1: Understand question via AI / Rule Parser
    // ----------------------------------------------------
    const intent = await extractIntent(message);

    // ----------------------------------------------------
    // Step 2: Deterministic computation from actual rows
    // ----------------------------------------------------
    let result: Record<string, unknown>;

    switch (intent.intent) {
      case "revenue":
        result = revenueByMonth(rows, intent.month);
        break;

      case "average":
      case "highest":
      case "lowest":
        result = revenueStats(rows, intent.month);
        break;

      case "sales":
        result = totalSales(rows, intent.month, intent.product);
        break;

      case "production":
        result = productionByMonth(rows, intent.month);
        break;

      case "compare": {
        const month1 = intent.months?.[0] || "January";
        const month2 = intent.months?.[1] || "February";
        result = compareRevenue(rows, month1, month2);
        break;
      }

      case "row_count":
        result = {
          rowCount: rows.length,
          columnCount: Object.keys(rows[0] || {}).length,
          month: intent.month,
        };
        break;

      case "columns":
        result = {
          columns: Object.keys(rows[0] || {}),
          columnCount: Object.keys(rows[0] || {}).length,
        };
        break;

      case "summary":
        result = calculateDashboard(rows) as unknown as Record<string, unknown>;
        break;

      default: {
        // If question mentions a month, return revenue and stats for that month
        if (intent.month) {
          result = revenueStats(rows, intent.month);
        } else {
          result = calculateDashboard(rows) as unknown as Record<string, unknown>;
        }
        break;
      }
    }

    // ----------------------------------------------------
    // Step 3: Natural language explanation
    // ----------------------------------------------------
    const answer = await generateResponse(message, result);

    return res.json({
      answer,
      sheetName: selectedSheetName,
    });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({
      message: "Failed to process question",
    });
  }
}
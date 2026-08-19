import { Response } from "express";
import * as XLSX from "xlsx";
import fs from "fs";

import type { RequestWithUser } from "../types/index.js";
import Dataset from "../models/Dataset.js";

import { extractIntent } from "../services/gemini/intent.js";
import { generateResponse } from "../services/gemini/response.js";

import { revenueByMonth } from "../services/excel/revenue.js";
import { totalSales } from "../services/excel/sales.js";
import { productionByMonth } from "../services/excel/production.js";
import { compareRevenue } from "../services/excel/compare.js";

export async function chat(
  req: RequestWithUser,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      datasetId,
      sheetName,
      message,
    } = req.body;

    if (!datasetId || !sheetName || !message) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    const buffer = fs.readFileSync(dataset.path);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });

    console.log("==================================");
    console.log("Available Sheets:");
    console.log(workbook.SheetNames);
    console.log("==================================");

    const selectedSheet = workbook.Sheets[sheetName];

    if (!selectedSheet) {
      return res.status(400).json({
        message: "Sheet not found",
      });
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      selectedSheet,
      {
        defval: "",
        raw: false,
      }
    );

    console.log("Selected Sheet:", sheetName);
    console.log("Rows:", rows.length);

    if (rows.length > 0) {
      console.log("First Row:");
      console.log(rows[0]);
    }

    // --------------------------
    // Step 1: Understand question
    // --------------------------

    const intent = await extractIntent(message);

    console.log("Detected Intent:");
    console.log(intent);

    let result: any = null;

    // --------------------------
    // Step 2: Execute Excel logic
    // --------------------------

    switch (intent.intent) {
      case "revenue":
        result = revenueByMonth(
          rows,
          intent.month
        );
        break;

      case "sales":
        result = totalSales(
          rows,
          intent.month
        );
        break;

      case "production":
        result = productionByMonth(
          rows,
          intent.month
        );
        break;

      case "compare":
        result = compareRevenue(
          rows,
          intent.months[0],
          intent.months[1]
        );
        break;

      default:
        result = {
          error:
            "Sorry, I couldn't understand the question.",
        };
    }

    console.log("Excel Result:");
    console.log(result);

    // --------------------------
    // Step 3: Generate response
    // --------------------------

    const answer = await generateResponse(
      message,
      result
    );

    return res.json({
      answer,
    });

  } catch (err: any) {
    console.error("CHAT ERROR");
    console.error(err);

    return res.status(500).json({
      message: err.message || "Chat failed",
    });
  }
}
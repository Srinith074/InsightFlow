import { Response } from "express";
import fs from "fs";
import * as XLSX from "xlsx";

import Dataset from "../models/Dataset.js";
import { calculateDashboard } from "../services/analytics.service.js";

export async function getDashboard(req: any, res: Response) {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    // Read Excel
    const buffer = fs.readFileSync(dataset.path);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    // Send rows to Analytics Service
    const dashboard = calculateDashboard(rows);

    return res.json(dashboard);

  }catch (error) {
  console.error("Dashboard Error:");
  console.error(error);

  return res.status(500).json({
    message: "Failed to generate dashboard",
  });
}
}
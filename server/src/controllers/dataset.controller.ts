import type { Response } from "express";
import XLSX from "xlsx";
import fs from "fs";

import Dataset from "../models/Dataset.js";
import {
  createDataset,
  getUserDatasets,
} from "../services/dataset.service.js";
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

  const buffer = fs.readFileSync(file.path);

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const firstSheet = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[firstSheet];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(
    worksheet,
    {
      header: 1,
      defval: "",
    }
  );

  const headers = Array.isArray(rows[0])
    ? rows[0].map((v) => String(v))
    : [];

  const rowCount = Math.max(0, rows.length - 1);

  const columnCount = headers.length;


  const sheetNames = workbook.SheetNames;

  const dataset = await createDataset({
    owner: user.id,
    name: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    rowCount,
    columnCount,
    headers,
    path: file.path,

    // NEW
    sheetNames,
    selectedSheet: sheetNames[0],
  });

  return res.json({
    dataset,
  });
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

    if (dataset.path && fs.existsSync(dataset.path)) {
      fs.unlinkSync(dataset.path);
    }

    await dataset.deleteOne();

    return res.json({
      success: true,
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete dataset",
    });
  }
}
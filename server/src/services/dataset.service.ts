import mongoose from "mongoose";
import Dataset from "../models/Dataset.js";

export async function createDataset(data: {
  owner: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  rowCount: number;
  columnCount: number;
  headers: string[];
  path: string;

  // NEW
  sheetNames: string[];
  selectedSheet: string;
}) {
  return Dataset.create({
    owner: new mongoose.Types.ObjectId(data.owner),

    name: data.name,
    fileName: data.fileName,
    mimeType: data.mimeType,

    size: data.size,

    rowCount: data.rowCount,
    columnCount: data.columnCount,

    headers: data.headers,

    path: data.path,

    // NEW
    sheetNames: data.sheetNames,
    selectedSheet: data.selectedSheet,
  });
}

export async function getUserDatasets(ownerId: string) {
  return Dataset.find({
    owner: new mongoose.Types.ObjectId(ownerId),
  }).sort({
    createdAt: -1,
  });
}
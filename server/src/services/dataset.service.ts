import mongoose from "mongoose";
import Dataset from "../models/Dataset.js";

export interface CreateDatasetInput {
  owner: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  rowCount: number;
  columnCount: number;
  headers: string[];
  sheetNames: string[];
  selectedSheet: string;
  storageKey?: string;
  storageProvider?: string;
  storageUrl?: string;
  path?: string;
}

export async function createDataset(data: CreateDatasetInput) {
  return Dataset.create({
    owner: new mongoose.Types.ObjectId(data.owner),
    name: data.name,
    fileName: data.fileName,
    mimeType: data.mimeType,
    size: data.size,
    rowCount: data.rowCount,
    columnCount: data.columnCount,
    headers: data.headers,
    sheetNames: data.sheetNames,
    selectedSheet: data.selectedSheet,
    storageKey: data.storageKey || "",
    storageProvider: data.storageProvider || "gridfs",
    storageUrl: data.storageUrl || "",
    path: data.path || "",
  });
}

export async function getUserDatasets(ownerId: string) {
  return Dataset.find({
    owner: new mongoose.Types.ObjectId(ownerId),
  }).sort({
    createdAt: -1,
  });
}
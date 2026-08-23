import mongoose from "mongoose";

export interface DatasetDocument extends mongoose.Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  rowCount: number;
  columnCount: number;
  headers: string[];
  path?: string;
  storageKey?: string;
  storageProvider?: string;
  storageUrl?: string;

  sheetNames: string[];
  selectedSheet: string;

  createdAt: Date;
  updatedAt: Date;
}

const datasetSchema = new mongoose.Schema<DatasetDocument>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    rowCount: {
      type: Number,
      required: true,
    },

    columnCount: {
      type: Number,
      required: true,
    },

    headers: {
      type: [String],
      required: true,
    },

    path: {
      type: String,
      default: "",
    },

    storageKey: {
      type: String,
      default: "",
    },

    storageProvider: {
      type: String,
      default: "gridfs",
    },

    storageUrl: {
      type: String,
      default: "",
    },

    sheetNames: {
      type: [String],
      default: [],
    },

    selectedSheet: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

datasetSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.__v;
    return returnedObject;
  },
});

const Dataset = mongoose.model<DatasetDocument>(
  "Dataset",
  datasetSchema
);

export default Dataset;
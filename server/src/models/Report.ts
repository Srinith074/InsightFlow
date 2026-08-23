import mongoose from "mongoose";

export interface ReportKPI {
  label: string;
  value: string;
  subtitle?: string;
}

export interface ReportPerformer {
  name: string;
  value: string;
  share?: string;
}

export interface ReportDataQuality {
  totalRows: number;
  qualityScore: number;
  warnings: string[];
}

export interface ReportDocument extends mongoose.Document {
  owner: mongoose.Types.ObjectId;
  datasetId: mongoose.Types.ObjectId;
  datasetName: string;
  sheetName: string;
  title: string;
  summary: string;
  kpis: ReportKPI[];
  insights: string[];
  topPerformers: ReportPerformer[];
  dataQualitySummary: ReportDataQuality;
  markdownContent: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema<ReportDocument>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },
    datasetName: {
      type: String,
      required: true,
      trim: true,
    },
    sheetName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    kpis: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        subtitle: { type: String },
      },
    ],
    insights: [{ type: String }],
    topPerformers: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        share: { type: String },
      },
    ],
    dataQualitySummary: {
      totalRows: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 100 },
      warnings: [{ type: String }],
    },
    markdownContent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ owner: 1, createdAt: -1 });

reportSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.__v;
    return returnedObject;
  },
});

const Report = mongoose.model<ReportDocument>("Report", reportSchema);

export default Report;

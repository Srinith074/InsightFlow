import mongoose from "mongoose";

export interface InsightEvidence {
  metric?: string;
  current?: string | number;
  previous?: string | number;
  delta?: string | number;
  details?: string;
}

export interface InsightDocument extends mongoose.Document {
  owner: mongoose.Types.ObjectId;
  datasetId: mongoose.Types.ObjectId;
  datasetName: string;
  sheetName: string;
  title: string;
  content: string;
  evidence?: InsightEvidence;
  category: "revenue" | "growth" | "product" | "quality" | "volume" | "general";
  createdAt: Date;
  updatedAt: Date;
}

const insightSchema = new mongoose.Schema<InsightDocument>(
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
    content: {
      type: String,
      required: true,
    },
    evidence: {
      metric: { type: String },
      current: { type: mongoose.Schema.Types.Mixed },
      previous: { type: mongoose.Schema.Types.Mixed },
      delta: { type: mongoose.Schema.Types.Mixed },
      details: { type: String },
    },
    category: {
      type: String,
      enum: ["revenue", "growth", "product", "quality", "volume", "general"],
      default: "general",
    },
  },
  {
    timestamps: true,
  }
);

insightSchema.index({ owner: 1, createdAt: -1 });

insightSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.__v;
    return returnedObject;
  },
});

const Insight = mongoose.model<InsightDocument>("Insight", insightSchema);

export default Insight;

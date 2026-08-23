import type { Response } from "express";
import mongoose from "mongoose";
import Insight from "../models/Insight.js";
import Dataset from "../models/Dataset.js";
import type { RequestWithUser } from "../types/index.js";

export async function createInsight(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { datasetId, datasetName, sheetName, title, content, evidence, category } = req.body;

    if (!datasetId || !mongoose.isValidObjectId(datasetId)) {
      return res.status(400).json({ message: "Valid dataset ID is required" });
    }

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    if (String(dataset.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const insight = await Insight.create({
      owner: user.id,
      datasetId,
      datasetName: datasetName || dataset.name,
      sheetName: sheetName || dataset.selectedSheet || "Sheet1",
      title: title.trim(),
      content: content.trim(),
      evidence,
      category: category || "general",
    });

    return res.status(201).json({
      success: true,
      insight: {
        id: insight._id.toString(),
        datasetId: insight.datasetId.toString(),
        datasetName: insight.datasetName,
        sheetName: insight.sheetName,
        title: insight.title,
        content: insight.content,
        evidence: insight.evidence,
        category: insight.category,
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create insight error:", error);
    return res.status(500).json({ message: "Failed to save insight" });
  }
}

export async function getInsights(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const query: Record<string, unknown> = { owner: user.id };
    if (req.query.datasetId && mongoose.isValidObjectId(String(req.query.datasetId))) {
      query.datasetId = req.query.datasetId;
    }

    const insights = await Insight.find(query).sort({ createdAt: -1 });

    return res.json({
      insights: insights.map((insight) => ({
        id: insight._id.toString(),
        datasetId: insight.datasetId.toString(),
        datasetName: insight.datasetName,
        sheetName: insight.sheetName,
        title: insight.title,
        content: insight.content,
        evidence: insight.evidence,
        category: insight.category,
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get insights error:", error);
    return res.status(500).json({ message: "Failed to retrieve insights" });
  }
}

export async function getInsightById(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid insight ID" });
    }

    const insight = await Insight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }

    if (String(insight.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({
      insight: {
        id: insight._id.toString(),
        datasetId: insight.datasetId.toString(),
        datasetName: insight.datasetName,
        sheetName: insight.sheetName,
        title: insight.title,
        content: insight.content,
        evidence: insight.evidence,
        category: insight.category,
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get insight by ID error:", error);
    return res.status(500).json({ message: "Failed to retrieve insight" });
  }
}

export async function updateInsight(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid insight ID" });
    }

    const insight = await Insight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }

    if (String(insight.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, content, category } = req.body;
    if (title) insight.title = title.trim();
    if (content) insight.content = content.trim();
    if (category) insight.category = category;

    await insight.save();

    return res.json({
      success: true,
      insight: {
        id: insight._id.toString(),
        datasetId: insight.datasetId.toString(),
        datasetName: insight.datasetName,
        sheetName: insight.sheetName,
        title: insight.title,
        content: insight.content,
        evidence: insight.evidence,
        category: insight.category,
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update insight error:", error);
    return res.status(500).json({ message: "Failed to update insight" });
  }
}

export async function deleteInsight(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid insight ID" });
    }

    const insight = await Insight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }

    if (String(insight.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await insight.deleteOne();

    return res.json({
      success: true,
      message: "Insight deleted successfully",
    });
  } catch (error) {
    console.error("Delete insight error:", error);
    return res.status(500).json({ message: "Failed to delete insight" });
  }
}

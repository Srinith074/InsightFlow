import type { Response } from "express";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import Report from "../models/Report.js";
import Dataset from "../models/Dataset.js";
import { calculateDashboard } from "../services/analytics.service.js";
import { detectDatasetSchema } from "../services/schema.service.js";
import { getFileBufferFromStorage } from "../services/storage.service.js";
import type { RequestWithUser } from "../types/index.js";

export async function createReport(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { datasetId, sheetName, title } = req.body;

    if (!datasetId || !mongoose.isValidObjectId(datasetId)) {
      return res.status(400).json({ message: "Valid dataset ID is required" });
    }

    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    if (String(dataset.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const buffer = await getFileBufferFromStorage(dataset);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const availableSheets = workbook.SheetNames || [];

    const targetSheet = sheetName && workbook.Sheets[sheetName]
      ? sheetName
      : availableSheets[0] || "";

    if (!targetSheet || !workbook.Sheets[targetSheet]) {
      return res.status(404).json({ message: "Sheet not found in workbook" });
    }

    const sheet = workbook.Sheets[targetSheet];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    // Compute deterministic analytics and schema diagnostics
    const analytics = calculateDashboard(rows);
    const schema = detectDatasetSchema(rows);

    const reportTitle = title?.trim() || `${dataset.name} — ${targetSheet} Executive Report`;
    const summary = `Comprehensive deterministic analysis generated from ${rows.length.toLocaleString()} records across ${schema.columns.length} columns in sheet "${targetSheet}". Overall data quality score: ${schema.quality.qualityScore}%.`;

    const kpis = [
      {
        label: "Total Revenue / Primary Metric",
        value: `₹${Math.round(analytics.totalRevenue).toLocaleString("en-IN")}`,
        subtitle: `${rows.length.toLocaleString()} records processed`,
      },
      {
        label: "Average Value / Order",
        value: `₹${Math.round(analytics.averageRevenue).toLocaleString("en-IN")}`,
        subtitle: "Deterministic row average",
      },
      {
        label: "Top Product Driver",
        value: analytics.topProduct || "N/A",
        subtitle: analytics.topProductShare ? `${analytics.topProductShare}% total share` : undefined,
      },
      {
        label: "Data Quality Score",
        value: `${schema.quality.qualityScore}%`,
        subtitle: `${schema.quality.warnings.length} quality warning(s)`,
      },
    ];

    const topPerformers = (analytics.productAnalytics?.topProducts || []).slice(0, 5).map((p) => ({
      name: p.name,
      value: `₹${Math.round(p.revenue).toLocaleString("en-IN")}`,
      share: `${p.share}%`,
    }));

    // Generate Markdown report content
    const dateFormatted = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let markdown = `# ${reportTitle}\n\n`;
    markdown += `**Generated Date:** ${dateFormatted}\n`;
    markdown += `**Source Dataset:** ${dataset.name}\n`;
    markdown += `**Target Sheet:** ${targetSheet}\n`;
    markdown += `**Records Analyzed:** ${rows.length.toLocaleString()} rows\n\n`;
    markdown += `---\n\n`;

    markdown += `## 1. Executive Summary\n\n${summary}\n\n`;

    markdown += `## 2. Key Performance Indicators\n\n`;
    markdown += `| KPI Indicator | Metric Value | Context |\n`;
    markdown += `| :--- | :--- | :--- |\n`;
    kpis.forEach((kpi) => {
      markdown += `| **${kpi.label}** | ${kpi.value} | ${kpi.subtitle || "-"} |\n`;
    });
    markdown += `\n`;

    markdown += `## 3. Automated Evidence-Backed Insights\n\n`;
    if (analytics.executiveInsights && analytics.executiveInsights.length > 0) {
      analytics.executiveInsights.forEach((ins) => {
        markdown += `- ${ins}\n`;
      });
    } else {
      markdown += `- No significant anomalies detected in this sheet.\n`;
    }
    markdown += `\n`;

    if (topPerformers.length > 0) {
      markdown += `## 4. Top Contributors & Drivers\n\n`;
      markdown += `| Rank | Name / SKU | Total Contribution | Share % |\n`;
      markdown += `| :--- | :--- | :--- | :--- |\n`;
      topPerformers.forEach((p, idx) => {
        markdown += `| ${idx + 1} | ${p.name} | ${p.value} | ${p.share || "-"} |\n`;
      });
      markdown += `\n`;
    }

    markdown += `## 5. Data Quality & Schema Diagnostics\n\n`;
    markdown += `- **Quality Score:** ${schema.quality.qualityScore}% / 100%\n`;
    markdown += `- **Duplicate Rows:** ${schema.quality.duplicateRowsCount}\n`;
    markdown += `- **Missing Values:** ${schema.quality.missingValuesCount}\n`;
    if (schema.quality.warnings.length > 0) {
      markdown += `\n**Quality Warnings:**\n`;
      schema.quality.warnings.forEach((w) => {
        markdown += `- ⚠️ ${w}\n`;
      });
    }
    markdown += `\n---\n*Report generated securely by InsightFlow AI Analytics Platform.*\n`;

    const report = await Report.create({
      owner: user.id,
      datasetId: dataset._id,
      datasetName: dataset.name,
      sheetName: targetSheet,
      title: reportTitle,
      summary,
      kpis,
      insights: analytics.executiveInsights || [],
      topPerformers,
      dataQualitySummary: {
        totalRows: rows.length,
        qualityScore: schema.quality.qualityScore,
        warnings: schema.quality.warnings,
      },
      markdownContent: markdown,
    });

    return res.status(201).json({
      success: true,
      report: {
        id: report._id.toString(),
        datasetId: report.datasetId.toString(),
        datasetName: report.datasetName,
        sheetName: report.sheetName,
        title: report.title,
        summary: report.summary,
        kpis: report.kpis,
        insights: report.insights,
        topPerformers: report.topPerformers,
        dataQualitySummary: report.dataQualitySummary,
        markdownContent: report.markdownContent,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ message: "Failed to generate report" });
  }
}

export async function getReports(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const query: Record<string, unknown> = { owner: user.id };
    if (req.query.datasetId && mongoose.isValidObjectId(String(req.query.datasetId))) {
      query.datasetId = req.query.datasetId;
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });

    return res.json({
      reports: reports.map((report) => ({
        id: report._id.toString(),
        datasetId: report.datasetId.toString(),
        datasetName: report.datasetName,
        sheetName: report.sheetName,
        title: report.title,
        summary: report.summary,
        kpis: report.kpis,
        insights: report.insights,
        topPerformers: report.topPerformers,
        dataQualitySummary: report.dataQualitySummary,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({ message: "Failed to retrieve reports" });
  }
}

export async function getReportById(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (String(report.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({
      report: {
        id: report._id.toString(),
        datasetId: report.datasetId.toString(),
        datasetName: report.datasetName,
        sheetName: report.sheetName,
        title: report.title,
        summary: report.summary,
        kpis: report.kpis,
        insights: report.insights,
        topPerformers: report.topPerformers,
        dataQualitySummary: report.dataQualitySummary,
        markdownContent: report.markdownContent,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get report by ID error:", error);
    return res.status(500).json({ message: "Failed to retrieve report" });
  }
}

export async function downloadReport(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (String(report.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const sanitizedFilename = (report.title || "report")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 60);

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedFilename}.md"`);

    return res.send(report.markdownContent);
  } catch (error) {
    console.error("Download report error:", error);
    return res.status(500).json({ message: "Failed to download report" });
  }
}

export async function deleteReport(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (String(report.owner) !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await report.deleteOne();

    return res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return res.status(500).json({ message: "Failed to delete report" });
  }
}

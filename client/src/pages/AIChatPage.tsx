import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { fetchDatasets } from "@/services/datasets";
import { askAI } from "@/services/chat";
import type { DatasetMetadata } from "@/types";
import {
  Bot,
  Database,
  FileSpreadsheet,
  Send,
  Sparkles,
  UploadCloud,
  User,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  message: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "What is the total revenue in May?",
  "Compare revenue between May and June",
  "Which product generated the highest revenue?",
  "How many records are in this dataset?",
  "What are the total sales in May?",
  "Show production in May",
];

export function AIChatPage() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [selectedSheet, setSelectedSheet] = useState<string>("");

  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      message:
        "Welcome to the AI Analyst workspace. Select a dataset and sheet, then ask any question regarding revenues, product performance, monthly comparisons, or row statistics. Answers are deterministically calculated from your actual raw data.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    async function loadDatasets() {
      try {
        setLoadingDatasets(true);
        const data = await fetchDatasets();
        setDatasets(data);

        if (data.length > 0) {
          const first = data[0];
          setSelectedDatasetId(first.id);
          const firstSheet = first.sheetNames?.[0] || first.selectedSheet || "";
          setSelectedSheet(firstSheet);
        }
      } catch (err) {
        console.error("Failed to load datasets:", err);
      } finally {
        setLoadingDatasets(false);
      }
    }

    loadDatasets();
  }, []);

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const dataset = datasets.find((d) => d.id === id);
    const firstSheet = dataset?.sheetNames?.[0] || dataset?.selectedSheet || "";
    setSelectedSheet(firstSheet);
  };

  const executeQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    if (!selectedDatasetId) {
      alert("Please select a dataset.");
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      message: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const answer = await askAI(selectedDatasetId, selectedSheet, q);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        message: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "ai",
        message: "Sorry, I could not compute an answer for this question. Please verify your selected dataset and sheet.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeQuestion(draft);
  };

  if (loadingDatasets) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading AI Analyst...
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="grid gap-6">
        <SectionHeader
          title="AI Analyst"
          description="Natural language queries backed by deterministic dataset computation."
        />

        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Sparkles className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No datasets available</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload a dataset to chat with the AI Analyst, calculate monthly revenue, and generate business insights.
              </p>
            </div>
            <Link to="/dashboard/upload">
              <Button className="mt-2 inline-flex items-center gap-2">
                <UploadCloud className="size-4" />
                Upload Dataset
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const sheetNames = selectedDataset?.sheetNames ?? [];

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="AI Analyst"
        description="Ask intelligent numerical and business questions anchored strictly to deterministic dataset computations."
      />

      {/* Dataset & Sheet Selector */}
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Database className="size-4 text-primary" />
                Active Dataset
              </div>
              <select
                value={selectedDatasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
              >
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>

            {sheetNames.length > 0 && (
              <div className="flex flex-1 flex-col gap-1 sm:items-end">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileSpreadsheet className="size-4 text-primary" />
                  Sheet
                </div>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
                >
                  {sheetNames.map((sheet) => (
                    <option key={sheet} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Container */}
      <Card className="flex h-[600px] flex-col border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">InsightFlow AI Analyst</CardTitle>
                <CardDescription className="text-xs">
                  Connected to "{selectedDataset?.name}" ({selectedSheet || "Default Sheet"})
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Deterministic Engine + Gemini Reasoning
            </Badge>
          </div>
        </CardHeader>

        {/* Messages Scroll Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isAI ? "items-start" : "flex-row-reverse items-start"}`}
              >
                <Avatar size="sm" className="mt-0.5">
                  <AvatarFallback className={isAI ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}>
                    {isAI ? <Bot className="size-4" /> : <User className="size-4" />}
                  </AvatarFallback>
                </Avatar>

                <div className={`max-w-[80%] rounded-3xl p-4 text-sm leading-relaxed ${
                  isAI
                    ? "bg-muted/80 text-foreground border border-border"
                    : "bg-primary text-primary-foreground shadow-sm"
                }`}>
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <span className="font-semibold text-xs opacity-80">
                      {isAI ? "InsightFlow AI" : "You"}
                    </span>
                    <span className="text-[10px] opacity-60">{m.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <Avatar size="sm" className="mt-0.5">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-3xl border border-border bg-muted/80 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-2 animate-bounce rounded-full bg-primary" />
                  <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                  <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  <span className="ml-1 text-xs">Executing deterministic calculation...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Prompts & Input Area */}
        <div className="border-t border-border p-4 sm:p-5 space-y-3 bg-card/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-muted-foreground whitespace-nowrap font-medium">Try asking:</span>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => executeQuestion(prompt)}
                disabled={loading}
                className="whitespace-nowrap rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about revenue, sales, comparisons, top products, or row counts..."
              disabled={loading}
              className="h-11 rounded-2xl text-sm"
            />
            <Button
              type="submit"
              disabled={loading || !draft.trim()}
              className="h-11 px-5 rounded-2xl inline-flex items-center gap-2"
            >
              <Send className="size-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
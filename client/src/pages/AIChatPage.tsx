import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  Input,
} from "@/components/ui";

import { fetchDatasets } from "@/services/datasets";
import { askAI } from "@/services/chat";
import type { DatasetMetadata } from "@/types";

interface Message {
  id: number;
  sender: "user" | "ai";
  message: string;
}

export function AIChatPage() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");

  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      message:
        "Hello! Upload a dataset, choose a sheet and ask me anything.",
    },
  ]);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const data = await fetchDatasets();

        setDatasets(data);

        if (data.length > 0) {
          setSelectedDataset(data[0].id);

          if (data[0].sheetNames.length > 0) {
            setSelectedSheet(data[0].sheetNames[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadDatasets();
  }, []);

  function changeDataset(id: string) {
    setSelectedDataset(id);

    const dataset = datasets.find(
      (d) => d.id === id
    );

    if (dataset) {
      setSelectedSheet(
        dataset.sheetNames[0] || ""
      );
    }
  }

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!draft.trim()) return;

    if (!selectedDataset) {
      alert("Select a dataset");
      return;
    }

    if (!selectedSheet) {
      alert("Select a sheet");
      return;
    }

    const question = draft;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        message: question,
      },
    ]);

    setDraft("");
    setLoading(true);

    try {
      const answer = await askAI(
        selectedDataset,
        selectedSheet,
        question
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          message: answer,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "ai",
          message:
            "Something went wrong.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="space-y-6 p-6">

          <h2 className="text-2xl font-bold">
            AI Dataset Chat
          </h2>

          {/* Dataset */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Dataset
            </label>

            <select
              className="w-full rounded border p-2"
              value={selectedDataset}
              onChange={(e) =>
                changeDataset(e.target.value)
              }
            >
              {datasets.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                >
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sheet */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Sheet
            </label>

            <select
              className="w-full rounded border p-2"
              value={selectedSheet}
              onChange={(e) =>
                setSelectedSheet(
                  e.target.value
                )
              }
            >
              {datasets
                .find(
                  (d) =>
                    d.id === selectedDataset
                )
                ?.sheetNames.map((sheet) => (
                  <option
                    key={sheet}
                    value={sheet}
                  >
                    {sheet}
                  </option>
                ))}
            </select>
          </div>

          {/* Messages */}

          <div className="space-y-4 max-h-[500px] overflow-y-auto">

            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={
                  m.sender === "ai"
                    ? "rounded-xl bg-muted p-4"
                    : "rounded-xl bg-primary/10 p-4"
                }
              >
                <b>
                  {m.sender === "ai"
                    ? "InsightFlow AI"
                    : "You"}
                </b>

                <p className="mt-2 whitespace-pre-wrap">
                  {m.message}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Input */}

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <Input
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value)
              }
              placeholder="Ask a question..."
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Thinking..."
                : "Send"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
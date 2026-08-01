import { useMemo, useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Button, Card, CardContent, Input } from "@/components/ui"
import type { ChatMessage } from "@/types"

const initialMessages: ChatMessage[] = [
  { id: "1", sender: "ai", message: "Welcome back! How can I help you optimize your analytics workflow today?", timestamp: "Now" },
]

export function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.trim()) {
      return
    }

    setMessages((previous) => [
      ...previous,
      { id: String(previous.length + 1), sender: "user", message: draft.trim(), timestamp: "Now" },
      { id: String(previous.length + 2), sender: "ai", message: "I found a new trend in the dataset and created a summary for your next report.", timestamp: "Now" },
    ])
    setDraft("")
  }

  const conversation = useMemo(() => messages.slice(-6), [messages])

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card/95 p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">AI assistant</p>
            <h2 className="text-2xl font-semibold text-foreground">Live chat</h2>
            <p className="text-sm text-muted-foreground">Ask questions, generate reports, and validate datasets in a conversational flow.</p>
          </div>
        </div>
      </div>
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="space-y-4 p-6">
          {conversation.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={message.sender === "ai" ? "rounded-3xl bg-muted p-4 text-sm text-foreground" : "self-end rounded-3xl bg-primary/10 p-4 text-sm text-foreground"}>
              <p className="font-medium">{message.sender === "ai" ? "InsightFlow AI" : "You"}</p>
              <p className="mt-2 leading-7">{message.message}</p>
              <p className="mt-3 text-xs text-muted-foreground">{message.timestamp}</p>
            </motion.div>
          ))}
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="chat">
                Ask a question
              </label>
              <Input id="chat" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Summarize last quarter's revenue trends..." />
            </div>
            <Button type="submit">Send message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

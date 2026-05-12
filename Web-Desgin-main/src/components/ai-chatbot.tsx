// AI Chatbot component — floating button + chat panel
// Uses Gemini API via VITE_GEMINI_API_KEY
import * as React from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export function AIChatbot() {
  const { state } = useApp();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the RentBuy assistant. Ask me anything about our products — I can recommend items, compare prices, or help you decide between buying and renting. 🛒",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (!GEMINI_API_KEY) {
        // Fallback demo response if no valid key is provided
        await new Promise((r) => setTimeout(r, 1500));
        const lowercaseText = text.toLowerCase();
        let mockReply = `I'm currently in demo mode (no valid API key provided). You asked about "${text}". `;
        
        if (lowercaseText.includes("rent") || lowercaseText.includes("buy")) {
          mockReply += "We offer flexible options: you can buy items outright or rent them by the day!";
        } else if (lowercaseText.includes("camera")) {
          mockReply += "I highly recommend the Lumen X1 Mirrorless Camera or the ActionPro 4K for your photography needs.";
        } else {
          mockReply += "Please browse our catalog to see all available products and categories.";
        }

        setMessages((prev) => [...prev, { role: "assistant", content: mockReply }]);
        return;
      }

      // Build product context for the AI
      const productContext = state.products
        .map(
          (p) =>
            `- ${p.name} (${p.category}): Buy $${p.price}, Rent $${p.rentPerDay}/day, Deposit $${p.deposit}. ${p.tagline}`,
        )
        .join("\n");

      const systemPrompt = `You are a helpful shopping assistant for RentBuy, a premium electronics marketplace. You help customers find the right products.

Current product catalog:
${productContext}

Rules:
- Be concise and friendly (max 3 sentences per response)
- Recommend specific products from the catalog when relevant
- Mention both buying and renting options where applicable
- If asked about something outside the catalog, politely redirect to available products`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: newMessages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            maxOutputTokens: 256,
          }
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as any).error?.message;
        if (msg && msg.toLowerCase().includes("api key not valid")) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `I'm currently in demo mode (the provided API key is invalid or expired). You asked about "${text}". Please browse our catalog to find what you're looking for!`,
            },
          ]);
          return;
        }
        throw new Error(msg ?? "API error");
      }

      const data = await res.json() as any;
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open AI assistant"}
        className={cn(
          "fixed bottom-24 right-4 z-50 grid size-14 place-items-center rounded-full shadow-elevated transition-all",
          "bg-gradient-ink text-cream md:bottom-6 md:right-6",
          open && "rotate-90 scale-95",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-44 right-4 z-50 flex w-[90vw] max-w-sm flex-col overflow-hidden",
            "rounded-2xl border border-border bg-card shadow-elevated",
            "md:bottom-24 md:right-6",
          )}
          style={{ height: "min(520px, 70vh)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
            <div className="grid size-8 place-items-center rounded-full bg-gradient-ink">
              <Bot className="size-4 text-cream" />
            </div>
            <div>
              <div className="text-sm font-semibold">RentBuy Assistant</div>
              <div className="text-[10px] text-muted-foreground">Powered by Gemini AI</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-gradient-ink text-cream rounded-br-sm"
                    : "mr-auto bg-muted text-foreground rounded-bl-sm",
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products…"
              className="h-9 rounded-full text-sm"
              disabled={loading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="size-9 shrink-0 rounded-full bg-gradient-ink"
              disabled={loading || !input.trim()}
            >
              <Send className="size-4 text-cream" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

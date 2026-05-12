import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/app-store";

export function MessageForm({ productId, onSent }: { productId: string; onSent?: () => void }) {
  const { dispatch, state } = useApp();
  const [name, setName] = React.useState(state.user?.name ?? "");
  const [email, setEmail] = React.useState(state.user?.email ?? "");
  const [body, setBody] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@") || body.trim().length < 8) {
      setErr("Please fill all fields. Message must be at least 8 characters.");
      return;
    }
    setErr(null);
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: crypto.randomUUID(),
        productId,
        fromName: name,
        fromEmail: email,
        body,
        createdAt: new Date().toISOString(),
        unread: true,
      },
    });
    setBody("");
    setSent(true);
    onSent?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="msg-name">Your name</Label>
          <Input id="msg-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="msg-email">Email</Label>
          <Input id="msg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="msg-body">Message</Label>
        <Textarea id="msg-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi, I have a question about this item…" />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      {sent && <p className="text-sm text-buy">Message sent — the seller will reply soon.</p>}
      <Button type="submit" className="w-full bg-gradient-ink">Send message</Button>
    </form>
  );
}

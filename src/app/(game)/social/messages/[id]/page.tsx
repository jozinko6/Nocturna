"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getConversationMessagesAction,
  sendPrivateMessageAction,
} from "@/app/actions/social.actions";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async () => {
    const result = await getConversationMessagesAction(conversationId);
    if (result.success) setMessages(result.data || []);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend() {
    if (!inputValue.trim() || sending) return;
    const content = inputValue.trim();
    setInputValue("");
    setSending(true);
    try {
      const result = await sendPrivateMessageAction(conversationId, content);
      if (result.success) {
        await loadMessages();
      } else {
        setInputValue(content);
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100dvh-60px)]">
      <PageHeader title="Konverzácia" subtitle="" />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-[#64748b]">
              Začni konverzáciu — napíš prvú správu.
            </p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMine = msg.is_mine || msg.sender_id === msg.current_character_id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-sm px-3 py-2 ${
                    isMine
                      ? "bg-[#1a1a2e] border border-[#3a3a5c] text-[#e2e8f0]"
                      : "bg-[#12121e] border border-[#2a2a44] text-[#cbd5e1]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p className="text-[10px] text-[#4a4a6c] mt-1">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString("sk", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#2a2a44] bg-[#0e0e1a] p-3 md:p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            placeholder="Napíš správu..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={sending}
          />
          <Button
            variant="primary"
            size="sm"
            loading={sending}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

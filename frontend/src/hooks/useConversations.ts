import { useState, useCallback, useEffect } from "react";
import type { Conversation, Message } from "../types";
import * as api from "../services/api";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchConversations().then((data) => {
      setConversations(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refreshConversations = useCallback(async () => {
    const data = await api.fetchConversations();
    setConversations(data);
  }, []);

  const createConversation = useCallback(
    async (thinkingEnabled: boolean): Promise<string> => {
      const conv = await api.createConversation(thinkingEnabled);
      setConversations((prev) => [conv, ...prev]);
      setCurrentId(conv.id);
      setMessages([]);
      return conv.id;
    },
    [],
  );

  const selectConversation = useCallback(async (id: string) => {
    setCurrentId(id);
    try {
      const detail = await api.fetchConversation(id);
      setMessages(detail.messages || []);
    } catch {
      setMessages([]);
    }
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentId === id) {
        setCurrentId(null);
        setMessages([]);
      }
    },
    [currentId],
  );

  const currentConversation =
    conversations.find((c) => c.id === currentId) ?? null;

  return {
    conversations,
    currentId,
    currentConversation,
    messages,
    setMessages,
    loading,
    createConversation,
    selectConversation,
    deleteConversation,
    refreshConversations,
  };
}

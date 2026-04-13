import { useState, useCallback, useRef } from "react";
import type { Message } from "../types";
import * as api from "../services/api";

interface UseChatOptions {
  conversationId: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onStreamEnd?: () => void;
}

export function useChat({
  conversationId,
  messages,
  setMessages,
  onStreamEnd,
}: UseChatOptions) {
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingDuration, setThinkingDuration] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval>>();

  const isStreaming = streamingMessageId !== null;

  const sendMessage = useCallback(
    async (content: string, thinkingEnabled: boolean, convId: string) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const tempUserMsgId = `temp-user-${Date.now()}`;
      const tempAssistantId = `temp-assistant-${Date.now()}`;

      const userMsg: Message = {
        id: tempUserMsgId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      const assistantMsg: Message = {
        id: tempAssistantId,
        role: "assistant",
        content: "",
        reasoning_content: thinkingEnabled ? "" : null,
        model: "deepseek-chat",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreamingMessageId(tempAssistantId);

      if (thinkingEnabled) {
        setIsThinking(true);
        setThinkingDuration(0);
        thinkingTimerRef.current = setInterval(() => {
          setThinkingDuration((d) => d + 1);
        }, 1000);
      }

      try {
        for await (const event of api.streamChat(
          convId,
          content,
          thinkingEnabled,
          controller.signal,
        )) {
          if (event.type === "reasoning") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, reasoning_content: (m.reasoning_content ?? "") + event.content }
                  : m,
              ),
            );
          } else if (event.type === "content") {
            if (thinkingTimerRef.current != null) {
              setIsThinking(false);
              clearInterval(thinkingTimerRef.current);
              thinkingTimerRef.current = undefined;
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, content: m.content + event.content }
                  : m,
              ),
            );
          } else if (event.type === "done") {
            if (event.message_id) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAssistantId ? { ...m, id: event.message_id! } : m,
                ),
              );
            }
          } else if (event.type === "error") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, content: `Error: ${event.content}` }
                  : m,
              ),
            );
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User stopped generation
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId
                ? { ...m, content: m.content || "Request failed" }
                : m,
            ),
          );
        }
      } finally {
        setStreamingMessageId(null);
        setIsThinking(false);
        if (thinkingTimerRef.current != null) {
          clearInterval(thinkingTimerRef.current);
          thinkingTimerRef.current = undefined;
        }
        abortControllerRef.current = null;
        onStreamEnd?.();
      }
    },
    [setMessages, onStreamEnd],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    streamingMessageId,
    isThinking,
    thinkingDuration,
    isStreaming,
    sendMessage,
    stopStreaming,
  };
}

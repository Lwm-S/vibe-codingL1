import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import type { Message } from "../types";

interface ChatAreaProps {
  messages: Message[];
  streamingMessageId: string | null;
  isThinking: boolean;
  thinkingDuration: number;
  onExampleClick?: (text: string) => void;
}

const EXAMPLES = [
  { icon: "💻", text: "Write a Python quicksort algorithm" },
  { icon: "🧮", text: "鸡兔同笼，共35个头，94只脚" },
  { icon: "⚛️", text: "Explain React virtual DOM in simple terms" },
  { icon: "📊", text: "Compare SQL JOIN types with examples" },
];

export default function ChatArea({
  messages,
  streamingMessageId,
  isThinking,
  thinkingDuration,
  onExampleClick,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessageId]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 opacity-80 blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white/90 mb-2 tracking-tight">
            What can I help with?
          </h2>
          <p className="text-white/35 text-sm mb-10 leading-relaxed">
            Chat with DeepSeek. Enable <span className="text-blue-400/70">Deep Think</span> for complex reasoning with visible thought process.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXAMPLES.map(({ icon, text }) => (
              <button
                key={text}
                onClick={() => onExampleClick?.(text)}
                className="group text-left text-[13px] text-white/50 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] rounded-xl px-4 py-3.5 transition-all duration-200"
              >
                <span className="mr-2">{icon}</span>
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.id === streamingMessageId && !isThinking}
            isThinking={msg.id === streamingMessageId && isThinking}
            thinkingDuration={msg.id === streamingMessageId ? thinkingDuration : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

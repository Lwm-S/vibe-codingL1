import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  thinkingDuration?: number;
}

export default function ThinkingBlock({
  content,
  isStreaming = false,
  thinkingDuration,
}: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) setExpanded(true);
  }, [isStreaming]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="group flex items-center gap-2 text-sm transition-colors"
      >
        {isStreaming ? (
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-blue-400 animate-spin" />
            <div className="absolute inset-[3px] rounded-full bg-blue-400/20" />
          </div>
        ) : (
          <svg
            className={`w-4 h-4 text-blue-400/70 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        )}
        <span className="text-blue-400/80 font-medium">
          {isStreaming ? "Thinking" : "Thought"}
        </span>
        {!isStreaming && thinkingDuration != null && thinkingDuration > 0 && (
          <span className="text-white/30 text-xs">
            {formatDuration(thinkingDuration)}
          </span>
        )}
        {isStreaming && (
          <span className="flex gap-[3px] ml-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[3px] h-[3px] bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[2000px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="relative pl-4 py-3 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-blue-500/60 via-purple-500/40 to-transparent" />
          <div className="text-[13px] text-white/50 leading-relaxed prose prose-invert prose-sm max-w-none [&_p]:text-white/50 [&_strong]:text-white/60 [&_em]:text-white/50">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

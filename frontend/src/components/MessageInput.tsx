import { useState, useRef, useCallback, useEffect } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  thinkingEnabled: boolean;
}

export default function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  thinkingEnabled,
}: MessageInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, []);

  useEffect(adjustHeight, [input, adjustHeight]);

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus();
  }, [isStreaming]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setInput("");
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-white/[0.05] rounded-2xl border border-white/[0.08] focus-within:border-white/[0.15] transition-all duration-200 shadow-lg shadow-black/20">
          {thinkingEnabled && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
              <div className="flex items-center gap-1.5 text-[11px] text-blue-400/70 bg-blue-500/[0.08] rounded-full px-2.5 py-1 border border-blue-500/[0.15]">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Deep Think
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-white/90 text-[14px] px-4 py-3.5 resize-none outline-none placeholder-white/25 disabled:opacity-40"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <div />
            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white/70 text-[13px] transition-colors border border-white/[0.08]"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || disabled}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-white/[0.06] disabled:text-white/20 text-white transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 disabled:shadow-none"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-3">
          Powered by DeepSeek API · AI may make mistakes
        </p>
      </div>
    </div>
  );
}

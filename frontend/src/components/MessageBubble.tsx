import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "./CodeBlock";
import ThinkingBlock from "./ThinkingBlock";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
  thinkingDuration?: number;
}

export default function MessageBubble({
  message,
  isStreaming = false,
  isThinking = false,
  thinkingDuration,
}: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] lg:max-w-[70%]">
          <div className="bg-white/[0.08] backdrop-blur-sm text-white/90 rounded-2xl rounded-br-lg px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap border border-white/[0.06]">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex gap-3.5 max-w-[90%] lg:max-w-[80%]">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mt-0.5 shadow-lg shadow-blue-500/20">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {message.reasoning_content != null && message.reasoning_content !== "" && (
            <ThinkingBlock
              content={message.reasoning_content}
              isStreaming={isThinking}
              thinkingDuration={thinkingDuration}
            />
          )}

          {isThinking && !message.content && (
            <div className="mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
            </div>
          )}

          {(message.content || (!isThinking && !isStreaming)) && (
            <div className="text-[14px] text-white/85 leading-[1.8] prose prose-invert prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_blockquote]:border-white/20 [&_blockquote]:text-white/50 [&_a]:text-blue-400 [&_a:hover]:text-blue-300 [&_strong]:text-white/95 [&_h1]:text-white/95 [&_h2]:text-white/95 [&_h3]:text-white/95 [&_table]:border-white/10 [&_th]:border-white/10 [&_td]:border-white/10">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code
                          className="bg-white/[0.08] text-blue-300/90 rounded-md px-1.5 py-[1px] text-[13px] border border-white/[0.06]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return <CodeBlock className={className}>{children}</CodeBlock>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-[2px] h-[18px] bg-blue-400 animate-pulse ml-0.5 align-text-bottom rounded-full" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

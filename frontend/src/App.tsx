import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import MessageInput from "./components/MessageInput";
import ModelSelector from "./components/ModelSelector";
import { useConversations } from "./hooks/useConversations";
import { useChat } from "./hooks/useChat";

export default function App() {
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    currentId,
    currentConversation,
    messages,
    setMessages,
    createConversation,
    selectConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations();

  const {
    messages: chatMessages,
    streamingMessageId,
    isThinking,
    thinkingDuration,
    isStreaming,
    sendMessage,
    stopStreaming,
  } = useChat({
    conversationId: currentId,
    messages,
    setMessages,
    onStreamEnd: () => {
      setTimeout(refreshConversations, 1500);
    },
  });

  // Update page title
  useEffect(() => {
    document.title = currentConversation?.title
      ? `${currentConversation.title} — DeepSeek Chat`
      : "DeepSeek Chat";
  }, [currentConversation?.title]);

  const handleSend = useCallback(
    async (content: string) => {
      let convId = currentId;
      if (!convId) {
        convId = await createConversation(thinkingEnabled);
      }
      sendMessage(content, thinkingEnabled, convId);
    },
    [currentId, thinkingEnabled, createConversation, sendMessage],
  );

  const handleNewChat = useCallback(async () => {
    await createConversation(thinkingEnabled);
  }, [thinkingEnabled, createConversation]);

  const handleExampleClick = useCallback(
    async (text: string) => {
      const convId = await createConversation(thinkingEnabled);
      sendMessage(text, thinkingEnabled, convId);
    },
    [thinkingEnabled, createConversation, sendMessage],
  );

  return (
    <div className="h-screen flex bg-[#0f0f17] text-white overflow-hidden">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={selectConversation}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 h-13 border-b border-white/[0.04] bg-[#0f0f17]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/[0.06]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/60 hidden sm:inline">
                {currentConversation?.title || "DeepSeek Chat"}
              </span>
            </div>
          </div>
          <ModelSelector
            thinkingEnabled={thinkingEnabled}
            onChange={setThinkingEnabled}
            disabled={isStreaming}
          />
        </header>

        <ChatArea
          messages={chatMessages}
          streamingMessageId={streamingMessageId}
          isThinking={isThinking}
          thinkingDuration={thinkingDuration}
          onExampleClick={handleExampleClick}
        />

        <MessageInput
          onSend={handleSend}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          thinkingEnabled={thinkingEnabled}
        />
      </main>
    </div>
  );
}

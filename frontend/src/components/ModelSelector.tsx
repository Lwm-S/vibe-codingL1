interface ModelSelectorProps {
  thinkingEnabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  thinkingEnabled,
  onChange,
  disabled,
}: ModelSelectorProps) {
  return (
    <button
      onClick={() => onChange(!thinkingEnabled)}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] transition-all duration-200 border
        disabled:opacity-40 disabled:cursor-not-allowed
        ${
          thinkingEnabled
            ? "bg-blue-500/[0.12] text-blue-400 border-blue-500/[0.2] shadow-sm shadow-blue-500/10"
            : "bg-white/[0.04] text-white/50 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/70"
        }
      `}
      title={thinkingEnabled ? "Deep Think mode ON" : "Deep Think mode OFF"}
    >
      <svg
        className={`w-4 h-4 transition-colors ${thinkingEnabled ? "text-blue-400" : "text-white/40"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
      <span className="font-medium">Think</span>
      <div
        className={`w-7 h-4 rounded-full flex items-center transition-all duration-200 ${
          thinkingEnabled ? "bg-blue-500 justify-end" : "bg-white/20 justify-start"
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-white mx-0.5 shadow-sm" />
      </div>
    </button>
  );
}

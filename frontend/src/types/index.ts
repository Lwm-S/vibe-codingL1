export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning_content?: string | null;
  model?: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  thinking_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface StreamEvent {
  type: "reasoning" | "content" | "done" | "error";
  content: string;
  message_id?: string;
}

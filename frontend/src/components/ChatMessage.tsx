import type { FlueConversationMessage } from "@flue/react";
import ToolCallCard from "./ToolCallCard.tsx";

type ChatMessageProps = {
  message: FlueConversationMessage;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <li className={message.role === "user" ? "flex flex-col items-end gap-1.5" : "flex flex-col items-start gap-1.5"}>
      <span className="text-xs text-[#858589]">{message.role === "user" ? "나" : "AI"}</span>
      <div
        className={
          message.role === "user"
            ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#262827] px-4 py-3 text-sm leading-6 whitespace-pre-wrap wrap-anywhere"
            : "w-full text-base leading-6 whitespace-pre-wrap wrap-anywhere"
        }
      >
        {message.parts.map((part) => {
          if (part.type === "text") {
            return <span key={part.text}>Text: {part.text}</span>;
          }

          if (part.type === "reasoning") {
            return (
              <em key={part.text} className="mb-1 block text-sm text-[#858589]">
                Reasoning: {part.text}
              </em>
            );
          }

          if (part.type === "dynamic-tool") {
            return <ToolCallCard key={part.toolCallId} part={part} />;
          }

          if (part.type === "data-progress") {
            return <span>Data Progress: {JSON.stringify(part.data, null, 2)}</span>;
          }
        })}

        <div>Metadata: {JSON.stringify(message.metadata, null, 2)}</div>
      </div>
    </li>
  );
};

export default ChatMessage;

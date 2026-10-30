import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => Promise<void>;
};

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    await onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 rounded-3xl border border-[#2d2d30] bg-[#19191a] py-2.5 pr-2.5 pl-5 transition-colors focus-within:border-[#626266]"
    >
      <label htmlFor="message" className="sr-only">
        메시지
      </label>
      <input
        id="message"
        type="text"
        name="message"
        placeholder="무엇이든 물어보세요"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[#858589] sm:text-sm"
      />
      <button
        type="submit"
        aria-label="메시지 전송"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f4f4f2] text-[#181819] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;

import { useFlueAgent } from "@flue/react";
import { createFlueClient } from "@flue/sdk";
import { useMemo, useState } from "react";

const url = "http://localhost:5173/agents/user-2";

const App = () => {
  const [message, setMessage] = useState("");
  const flueClient = useMemo(() => createFlueClient({ url, token: "TEST_TOKEN" }), []);
  const { sendMessage, messages, status } = useFlueAgent({ client: flueClient });

  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    const submittedMessage = message.trim();

    if (!submittedMessage) {
      return;
    }

    await sendMessage(submittedMessage);
    setMessage("");
  };

  const isThinking = status === "streaming" || status === "submitted";

  return (
    <main className="flex h-dvh flex-col bg-[#08080a] text-[#ededed]">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-8">
        <ul aria-label="대화 내용" className="mx-auto flex w-full max-w-3xl flex-col gap-6 pt-4 pb-8">
          {messages.map((message) => (
            <li
              key={message.id}
              className={
                message.role === "user" ? "flex flex-col items-end gap-1.5" : "flex flex-col items-start gap-1.5"
              }
            >
              <span className="text-xs text-[#858589]">{message.role === "user" ? "나" : "AI"}</span>
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#262827] px-4 py-3 text-sm leading-6 whitespace-pre-wrap wrap-anywhere"
                    : "w-full text-base leading-6 whitespace-pre-wrap wrap-anywhere"
                }
              >
                {message.parts.map((part) => {
                  if (part.type === "reasoning") {
                    return (
                      <em key={part.text} className="mb-1 block text-sm text-[#858589]">
                        {part.text}
                      </em>
                    );
                  }

                  if (part.type === "text") {
                    return <span key={part.text}>{part.text}</span>;
                  }
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="mx-auto max-w-3xl">
          {isThinking && (
            <p role="status" className="m-6 px-1 text-center text-sm text-[#858589]">
              생각 중...
            </p>
          )}
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
        </div>
      </div>
    </main>
  );
};

export default App;

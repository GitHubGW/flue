import { useFlueAgent } from "@flue/react";
import { createFlueClient } from "@flue/sdk";
import { useMemo, useState } from "react";

const url = "http://localhost:5173/agents/gw-4";

const App = () => {
  const [message, setMessage] = useState("");
  const flueClient = useMemo(() => createFlueClient({ url, token: "TEST_TOKEN" }), []);
  const { messages, status } = useFlueAgent({ client: flueClient });

  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    await flueClient.send({
      message: { kind: "user", body: trimmedMessage },
      initialData: { name: "GW" },
    });
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
                    return (
                      <div
                        key={part.toolCallId}
                        className="my-4 overflow-hidden rounded-2xl border border-[#303033] bg-[#161618] text-sm whitespace-normal"
                      >
                        <div className="flex items-center justify-between gap-4 px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#35313e] bg-[#25212e] text-[#b9acd6]"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-4"
                              >
                                <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 20" />
                              </svg>
                            </span>
                            <strong className="min-w-0 font-medium wrap-anywhere">{part.toolName}</strong>
                          </div>
                          <span
                            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${part.state === "output-error" ? "bg-[#f2a3a3]/10 text-[#f2a3a3]" : part.state === "output-available" ? "bg-[#9ed8c8]/10 text-[#9ed8c8]" : "bg-[#c8bd96]/10 text-[#c8bd96]"}`}
                          >
                            <span aria-hidden="true" className="size-1 rounded-full bg-current" />
                            {part.state === "input-available" && "결과 대기 중"}
                            {part.state === "output-available" && "완료"}
                            {part.state === "output-error" && "오류"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 px-3 pb-3 sm:grid-cols-2">
                          <div className="min-w-0 rounded-xl border border-white/5 bg-[#1c1c1f] p-4">
                            <p className="mb-3 text-xs font-medium text-[#92929c]">
                              입력{" "}
                              <span aria-hidden="true" className="ml-1 text-[#62626d]">
                                ↘
                              </span>
                            </p>
                            <pre className="overflow-x-auto font-mono text-sm leading-6 text-[#d4d4d8]">
                              {JSON.stringify(part.input, null, 2) ?? "입력 없음"}
                            </pre>
                          </div>
                          <div className="min-w-0 rounded-xl border border-white/5 bg-[#1a201f] p-4">
                            <p className="mb-3 text-xs font-medium text-[#929f9b]">
                              출력{" "}
                              <span aria-hidden="true" className="ml-1 text-[#647a72]">
                                ↗
                              </span>
                            </p>
                            <pre
                              className={`overflow-x-auto font-mono text-sm leading-6 ${part.state === "output-error" ? "text-[#f2a3a3]" : "text-[#a8dace]"}`}
                            >
                              {part.state === "output-error"
                                ? part.errorText
                                : part.state === "output-available"
                                  ? (JSON.stringify(part.output, null, 2) ?? "출력 없음")
                                  : "결과를 기다리고 있어요..."}
                            </pre>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (part.type === "data-progress") {
                    return <span>Data Progress: {JSON.stringify(part.data, null, 2)}</span>;
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

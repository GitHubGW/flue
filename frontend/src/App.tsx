import { useFlueAgent } from "@flue/react";
import { createFlueClient } from "@flue/sdk";
import { useMemo } from "react";
import ChatInput from "./components/ChatInput.tsx";
import ChatMessage from "./components/ChatMessage.tsx";

const url = "https://backend.kowonp.workers.dev/agents/1";

const App = () => {
  const flueClient = useMemo(() => createFlueClient({ url, token: "TEST_TOKEN" }), []);
  const { messages, status, sendMessage } = useFlueAgent({ client: flueClient });

  const onSend = async (message: string) => {
    await sendMessage(message, { initialData: { name: "GW" } });
  };

  const isThinking = status === "streaming" || status === "submitted";

  return (
    <main className="flex h-dvh flex-col bg-[#08080a] text-[#ededed]">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-8">
        <ul aria-label="대화 내용" className="mx-auto flex w-full max-w-3xl flex-col gap-6 pt-4 pb-8">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
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
          <ChatInput onSend={onSend} />
        </div>
      </div>
    </main>
  );
};

export default App;

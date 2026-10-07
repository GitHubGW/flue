import { useFlueAgent } from "@flue/react";
import { useState } from "react";

const url = "http://localhost:5173/agents/hello/user-2";

const App = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, messages, status } = useFlueAgent({ url });

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
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.parts.map((part) => {
              if (part.type === "reasoning") {
                return (
                  <em key={part.text}>
                    AI Reasoning: {part.text}
                    <br />
                  </em>
                );
              }

              if (part.type === "text") {
                return <span key={part.text}>{part.text}</span>;
              }
            })}
          </li>
        ))}
      </ul>

      <hr />
      {isThinking ? "생각중입니다..." : ""}
      <hr />

      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="message"
          placeholder="메시지를 입력해주세요"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

export default App;

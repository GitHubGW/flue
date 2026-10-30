import type { FlueConversationPart } from "@flue/react";

type ToolCallPart = Extract<FlueConversationPart, { type: "dynamic-tool" }>;

type ToolCallCardProps = {
  part: ToolCallPart;
};

const ToolCallCard = ({ part }: ToolCallCardProps) => {
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-[#303033] bg-[#161618] text-sm whitespace-normal">
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
};

export default ToolCallCard;

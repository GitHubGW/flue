"use agent";

import { useDataWriter, useInitialData, useModel, usePersistentState, useTool } from "@flue/runtime";
import * as v from "valibot";

const glmModel = "cloudflare/@cf/zai-org/glm-4.7-flash";
const gemmaModel = "cloudflare/@cf/google/gemma-4-26b-a4b-it";

export const CustomerSupport = () => {
  const { name } = useInitialData<v.InferOutput<typeof CustomerSupport.initialData>>();
  const [mode, setMode] = usePersistentState<"fast" | "slow">("mode", "slow");
  useModel(mode === "fast" ? glmModel : gemmaModel, { compaction: { model: gemmaModel } });

  const writeProgress = useDataWriter("progress", {
    schema: v.object({ stage: v.string() }),
  });

  useTool({
    name: "set_mode",
    description: "사용자가 에이전트의 응답 속도를 조절하기 위해 사용하는 도구입니다.",
    input: v.object({ mode: v.picklist(["fast", "slow"]) }),
    run: async ({ data }) => {
      setMode(data.mode);
      return { output: `새로운 모드 "${data.mode}"로 설정되었습니다.` };
    },
  });

  useTool({
    name: "add",
    description: "두 수를 더하는 도구입니다.",
    input: v.object({ a: v.number(), b: v.number() }),
    output: v.object({ result: v.number() }),
    run: async ({ data }) => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      writeProgress({ stage: "동작중..." });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      writeProgress({ stage: "완료" });
      return { output: { result: data.a + data.b } };
    },
  });

  return `당신은 친절한 고객 지원 에이전트입니다.
  지금 대화 중인 사용자(고객)의 이름은 "${name}"입니다.
  당신은 현재 ${mode} 모드로 작동하고 있습니다.`;
};

CustomerSupport.initialData = v.object({
  name: v.string(),
});

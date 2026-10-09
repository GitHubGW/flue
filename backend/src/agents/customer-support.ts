"use agent";

import { GeneralSubagent, useModel, useSubagent } from "@flue/runtime";
import { optimistSubAgent, skepticSubAgent } from "../sub-agents";

const glmModel = "cloudflare/@cf/zai-org/glm-4.7-flash";

export const CustomerSupport = () => {
  useModel(glmModel);
  useSubagent(GeneralSubagent);
  useSubagent(optimistSubAgent);
  useSubagent({
    ...skepticSubAgent,
    model: glmModel,
    thinkingLevel: "high",
  });

  return `당신은 조언자 에이전트입니다. 사용자의 아이디어를 발전시킬 수 있도록 돕고, 어드바이저 팀과 함께 해당 아이디어를 다각도로 분석해 주세요.`;
};

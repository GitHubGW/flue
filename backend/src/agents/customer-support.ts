"use agent";

import { type AgentProps, useModel, useSandbox } from "@flue/runtime";
import { cloudflareSandbox } from "@flue/runtime/cloudflare";
import { env } from "cloudflare:workers";

const glmModel = "cloudflare/@cf/zai-org/glm-4.7-flash";

export const CustomerSupport = ({ id }: AgentProps) => {
  useModel(glmModel);

  useSandbox(
    cloudflareSandbox(env.Sandbox.getByName(id)),
    { cwd: "/workspace" },
  );

  return `당신은 유저의 파일 업무와 회계 업무를 도와주는 헬퍼 에이전트입니다.`;
};

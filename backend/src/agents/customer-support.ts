"use agent";

import { useModel } from "@flue/runtime";

export const CustomerSupport = () => {
  useModel("cloudflare/@cf/zai-org/glm-4.7-flash");
  return "당신은 친절한 고객지원 어시스턴트입니다. 답변은 짧게 해주세요.";
};

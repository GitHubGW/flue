"use agent";

import { useModel } from "@flue/runtime";

export const Hello = () => {
  useModel("cloudflare/@cf/zai-org/glm-5.3-flash");
  return "You are a helpful assistant. Keep replies short.";
};

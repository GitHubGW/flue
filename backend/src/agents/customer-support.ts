"use agent";

import { defineMcpConnection, useMcpConnection, useModel, useSkill } from "@flue/runtime";
import quickSummarySkill from "../skills/quick-summary/SKILL.md";

const glmModel = "cloudflare/@cf/zai-org/glm-4.7-flash";

const cloudflareMcpConnection = defineMcpConnection({
  name: "cloudflare_docs",
  url: "https://docs.mcp.cloudflare.com/mcp",
});

export const CustomerSupport = () => {
  useSkill(quickSummarySkill);
  useMcpConnection(cloudflareMcpConnection);
  useModel(glmModel);
};

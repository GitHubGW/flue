"use agent";

import { useModel, useSkill } from "@flue/runtime";
import quickSummarySkill from "../skills/quick-summary/SKILL.md";

const glmModel = "cloudflare/@cf/zai-org/glm-4.7-flash";

export const CustomerSupport = () => {
  useSkill(quickSummarySkill);
  useModel(glmModel);
};

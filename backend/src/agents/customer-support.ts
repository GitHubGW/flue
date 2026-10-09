"use agent";

import { bash, useModel, useSandbox } from "@flue/runtime";
import { Bash, InMemoryFs } from "just-bash";

const glmModel = "cloudflare/@cf/zai-org/glm-4.7-flash";

const briefFile = `
# Monthly sales report
Analyze the sales data.
Calculate total revenue and revenue by product.
Write the results to report.md.
`.trim();

const salesFile = `
product,revenue
Keyboard,1200
Monitor,2400
Keyboard,800
Mouse,600
Monitor,1600`.trim();

const files = {
  "/workspace/brief.md": briefFile,
  "/workspace/sales.csv": salesFile,
};

export const CustomerSupport = () => {
  useModel(glmModel);

  useSandbox(
    bash(() => new Bash({ fs: new InMemoryFs(files) })),
    { cwd: "/workspace" },
  );

  return `당신은 유저의 파일 업무와 회계 업무를 도와주는 헬퍼 에이전트입니다.`;
};

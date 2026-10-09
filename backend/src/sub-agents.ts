import { defineSubagent } from "@flue/runtime";

const OptimistSubAgent = () => {
  return `
    이 아이디어를 긍정적인 시각에서 평가해 주세요.

    다음 항목을 찾아내세요:
    - 가장 강력한 기회 요소
    - 이 아이디어를 원할 타깃 사용자
    - 성공할 수 있는 이유
    - 아이디어를 더 강화할 수 있는 한 가지 방법

    간결하게 분석한 결과를 반환하세요.
  `;
};

const SkepticSubAgent = () => {
  return `
    이 아이디어를 회의적인(비판적인) 시각에서 평가해 주세요.

    다음 항목을 찾아내세요:
    - 가장 취약한 전제 조건
    - 가장 큰 현실적/실무적 리스크
    - 사용자가 이 아이디어를 거부할 수 있는 이유
    - 반드시 검증(답변)해야 하는 핵심 질문 한 가지

    비판적이지만 공정하게 평가해 주세요.
  `;
};

export const optimistSubAgent = defineSubagent({
  name: "optimistSubAgent",
  description: "이 아이디어를 긍정적인 시각에서 평가해 주세요.",
  agent: OptimistSubAgent,
});

export const skepticSubAgent = defineSubagent({
  name: "skepticSubAgent",
  description: "이 아이디어를 회의적인(비판적인) 시각에서 평가해 주세요.",
  agent: SkepticSubAgent,
});

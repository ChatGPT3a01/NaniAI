export type Difficulty = "basic" | "medium" | "advanced";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: "基礎",
  medium: "中等",
  advanced: "進階",
};

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  basic: "著重基本概念的理解與記憶，題目以直接問答、是非題、簡單選擇題為主",
  medium: "著重概念的應用與分析，題目包含情境應用、比較分析、簡答題",
  advanced: "著重高層次思維，包含批判思考、創意應用、跨領域整合、開放式問答",
};

export function getAssessmentPrompt(text: string, difficulty: Difficulty): string {
  return `你是一位專業的教育評量設計師。請根據以下教科書內容，設計${DIFFICULTY_LABELS[difficulty]}程度的評量試題。

## 難度要求
${DIFFICULTY_DESC[difficulty]}

## 教科書內容
${text}

## 輸出要求
請設計剛好 10 題，以 JSON 格式輸出，格式如下：
\`\`\`json
{
  "title": "評量標題",
  "difficulty": "${DIFFICULTY_LABELS[difficulty]}",
  "questions": [
    {
      "number": 1,
      "type": "choice",
      "question": "題目內容",
      "options": ["A. 選項一", "B. 選項二", "C. 選項三", "D. 選項四"],
      "answer": "A",
      "explanation": "解析說明"
    }
  ]
}
\`\`\`

題型分配建議：
- 選擇題 (choice): 6 題
- 是非題 (truefalse): 2 題（用 options: ["O 正確", "X 錯誤"]）
- 簡答題 (short): 2 題（不需 options）

請只回覆 JSON，不要有其他文字。`;
}

export const ASSESSMENT_SYSTEM_PROMPT = `你是台灣的專業教育評量設計師，熟悉十二年國教課綱。
你設計的題目要符合台灣教育體系的用語和風格。
請使用繁體中文。所有輸出必須是有效的 JSON 格式。`;

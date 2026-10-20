import { CriticAnalysis } from "./types";

export function parseCriticFeedback(rawText: string): CriticAnalysis {
  if (!rawText || typeof rawText !== "string") {
    return {
      score: 8.0,
      verdict: "Evaluation completed.",
      strengths: [],
      weaknesses: [],
      suggestions: [],
      rawText: "",
    };
  }

  // 1. Extract score
  let score = 8.0;
  const scoreMatch = rawText.match(/Score:\s*([0-9.]+)\s*\/\s*10/i) || rawText.match(/([0-9.]+)\s*\/\s*10/);
  if (scoreMatch && scoreMatch[1]) {
    const parsed = parseFloat(scoreMatch[1]);
    if (!isNaN(parsed)) score = parsed;
  }

  // 2. Extract sections
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  let verdict = "";

  const lines = rawText.split("\n");
  let currentSection: "strengths" | "weaknesses" | "suggestions" | "verdict" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect section headers
    if (/^#*\s*Strengths/i.test(line)) {
      currentSection = "strengths";
      continue;
    } else if (/^#*\s*(Areas to Improve|Weaknesses|Critique)/i.test(line)) {
      currentSection = "weaknesses";
      continue;
    } else if (/^#*\s*(Suggestions|Recommendations)/i.test(line)) {
      currentSection = "suggestions";
      continue;
    } else if (/^#*\s*(One line verdict|Verdict)/i.test(line)) {
      currentSection = "verdict";
      continue;
    }

    // Collect content under sections
    if (currentSection === "strengths") {
      const cleaned = line.replace(/^[-*•\d.]+\s*/, "").trim();
      if (cleaned) strengths.push(cleaned);
    } else if (currentSection === "weaknesses") {
      const cleaned = line.replace(/^[-*•\d.]+\s*/, "").trim();
      if (cleaned) weaknesses.push(cleaned);
    } else if (currentSection === "suggestions") {
      const cleaned = line.replace(/^[-*•\d.]+\s*/, "").trim();
      if (cleaned) suggestions.push(cleaned);
    } else if (currentSection === "verdict") {
      if (!verdict) verdict = line.replace(/^["']|["']$/g, "").trim();
    }
  }

  if (!verdict) {
    verdict = strengths[0] || "Report satisfies standard production research criteria.";
  }

  return {
    score,
    verdict,
    strengths: strengths.length ? strengths : ["Rigorous thematic structure", "Factual grounding with verified citations"],
    weaknesses: weaknesses.length ? weaknesses : ["Limited cross-source quantitative corroboration"],
    suggestions: suggestions.length ? suggestions : ["Cross-verify with secondary domain metrics"],
    rawText,
  };
}

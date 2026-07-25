export function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const arrStart = trimmed.indexOf("[");
  if (arrStart >= 0 && (start < 0 || arrStart < start)) {
    const end = trimmed.lastIndexOf("]");
    if (end > arrStart) return trimmed.slice(arrStart, end + 1);
  }
  if (start >= 0) {
    const end = trimmed.lastIndexOf("}");
    if (end > start) return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export function jsonSystemPrompt(system: string, schemaHint?: string): string {
  return schemaHint
    ? `${system}\n\nAntworte NUR mit validem JSON ohne Markdown. Schema:\n${schemaHint}`
    : `${system}\n\nAntworte NUR mit validem JSON ohne Markdown.`;
}

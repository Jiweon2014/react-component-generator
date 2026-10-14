export const PROMPT_HISTORY_MAX = 10;

export function addPromptToHistory(
  history: string[],
  prompt: string,
  max: number = PROMPT_HISTORY_MAX,
): string[] {
  return [prompt, ...history.filter((item) => item !== prompt)].slice(0, max);
}

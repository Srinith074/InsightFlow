export function parseQuestion(question: string) {
  const q = question.toLowerCase();

  return {
    wantsRevenue: q.includes("revenue"),
    wantsTotal: q.includes("total"),
    wantsSheet: q.includes("sheet"),

    month:
      q.match(
        /(january|february|march|april|may|june|july|august|september|october|november|december)/
      )?.[0] ?? null,

    year:
      Number(q.match(/\b20\d{2}\b/)?.[0]) || null,
  };
}
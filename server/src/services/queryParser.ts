const months: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export function parseQuestion(question: string) {
  const q = question.toLowerCase();

  let intent = "";

  // revenue
  if (
    q.includes("revenue") ||
    q.includes("income") ||
    q.includes("earned") ||
    q.includes("sales")
  ) {
    if (q.includes("average")) {
      intent = "averageRevenue";
    } else if (
      q.includes("highest") ||
      q.includes("maximum") ||
      q.includes("max")
    ) {
      intent = "highestRevenue";
    } else if (
      q.includes("lowest") ||
      q.includes("minimum") ||
      q.includes("min")
    ) {
      intent = "lowestRevenue";
    } else {
      intent = "totalRevenue";
    }
  }

  if (q.includes("which sheet")) {
    intent = "sheet";
  }

  if (q.includes("rows")) {
    intent = "rows";
  }

  if (
    q.includes("columns") ||
    q.includes("headers")
  ) {
    intent = "columns";
  }

  let month: number | undefined;

  for (const [name, value] of Object.entries(months)) {
    if (q.includes(name)) {
      month = value;
      break;
    }
  }

  const yearMatch = q.match(/20\d{2}/);

  const year = yearMatch
    ? Number(yearMatch[0])
    : undefined;

  return {
    intent,
    month,
    year,
  };
}
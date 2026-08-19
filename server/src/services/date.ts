export function excelDateToJSDate(serial: number) {
  return new Date(
    Math.round((serial - 25569) * 86400 * 1000)
  );
}

export function getMonthYear(value: any) {
  if (!value) return null;

  const date =
    typeof value === "number"
      ? excelDateToJSDate(value)
      : new Date(value);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}
export function excelDateToJS(serial: number) {
  return new Date((serial - 25569) * 86400 * 1000);
}
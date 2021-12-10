/**
 * Get current Date and Time (without spaces or symbols)
 * @returns String
 */
export function getCurrentDate() {
  const [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
  const [hour, minute, seconds] = new Date().toLocaleTimeString("en-US").split(":");
  const time = `${month}${date}${year}${hour}${minute}${seconds.replace(" ", "")}`;
  return time;
}
/**
     * Generate a UNIQUE Random name using date and time.
     * @param {String} prefix Some prefix that references what it will be naming
     * @returns String
     */
export function generateUniqueName(prefix: string) {
  return `${prefix}-${getCurrentDate()}`;
}
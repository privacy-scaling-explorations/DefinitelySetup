export function truncateString(str: string, numCharacters = 5): string {
  if (str.length <= numCharacters * 2) {
    return str;
  }

  const firstPart = str.substr(0, numCharacters);
  const lastPart = str.substr(-numCharacters);

  return `${firstPart}...${lastPart}`;
}
export function parseDate(dateString: number): string {
  const parsedDate = new Date(dateString);
  return parsedDate.toDateString();
}

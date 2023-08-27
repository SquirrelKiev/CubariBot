export function truncate(str: string, limit: number, useWordBoundary: boolean): string {
  if (str.length <= limit) {
    return str;
  }
  const subString = str.slice(0, limit - 1);
  return (
    (useWordBoundary && subString.lastIndexOf(" ") !== -1
      ? subString.slice(0, subString.lastIndexOf(" "))
      : subString) + "…"
  );
}

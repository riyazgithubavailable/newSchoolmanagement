export const normalizeDate = (d?: Date | string) => {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const toDateOnlyString = (d?: Date | string) => {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 10); // YYYY-MM-DD
};
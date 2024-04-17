export const getFormattedDate = (date?: Date | null | number): string => {
  if (!date) return 'Not a Valid Date';
  const d = new Date(date);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();

  return `${day} ${month}, ${year}`;
};

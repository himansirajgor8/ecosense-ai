export function formatCityName(fullName) {
  if (!fullName) return '';

  const parts = String(fullName).split(',');
  return parts[0].trim();
}

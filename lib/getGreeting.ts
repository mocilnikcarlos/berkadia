// lib/getGreeting.ts

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Buen día";
  if (hour >= 12 && hour < 19) return "Buenas tardes";

  return "Buenas noches";
}

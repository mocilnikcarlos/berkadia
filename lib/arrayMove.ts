export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

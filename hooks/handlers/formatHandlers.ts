export function handleFormatHotkeys(e: React.KeyboardEvent, block: HTMLDivElement) {
  if (!e.ctrlKey && !e.metaKey) return false;

  const key = e.key.toLowerCase();
  const cmd: Record<string, string> = {
    b: "bold",
    i: "italic",
    x: e.shiftKey ? "strikeThrough" : "",
    "7": e.shiftKey ? "insertOrderedList" : "",
    "8": e.shiftKey ? "insertUnorderedList" : "",
  };

  const command = cmd[key];
  if (command) {
    e.preventDefault();
    document.execCommand(command);
    return true;
  }

  return false;
}

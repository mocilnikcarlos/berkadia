import { focusNode, replaceLineWith } from "../helpers/domHelpers";

export function handleLinePatterns(e: React.KeyboardEvent, block: HTMLDivElement) {
  if (e.key !== " ") return false;

  const sel = window.getSelection();
  const anchor = sel?.anchorNode;
  if (!anchor) return false;

  const element =
    anchor.nodeType === Node.TEXT_NODE
      ? anchor.parentElement
      : (anchor as HTMLElement);

  if (!element || element.closest("li, ul, ol, blockquote")) return false;

  let line: HTMLElement = element;
  while (
    line.parentElement &&
    line.parentElement !== block &&
    !["DIV", "P"].includes(line.tagName)
  ) {
    line = line.parentElement;
  }

  const lineText = (line.textContent || "").trim();

  const createAndReplace = (tag: keyof HTMLElementTagNameMap) => {
    e.preventDefault();
    const node = document.createElement(tag);
    const inner = tag === "blockquote" ? "<br>" : "<li><br></li>";
    node.innerHTML = inner;
    replaceLineWith(line, block, node);
    const focusTarget = node.querySelector("li") || node;
    setTimeout(() => focusNode(focusTarget as HTMLElement), 0);
  };

  if (lineText === "-" || lineText === "*") createAndReplace("ul");
  else if (/^\d+\.$/.test(lineText)) createAndReplace("ol");
  else if (lineText === ">") createAndReplace("blockquote");

  return true;
}

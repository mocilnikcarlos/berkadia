import { focusNode } from "../helpers/domHelpers";

export function handleListEnter(e: React.KeyboardEvent) {
  if (e.key !== "Enter") return false;

  const sel = window.getSelection();
  if (!sel?.anchorNode) return false;

  const element =
    sel.anchorNode.nodeType === Node.TEXT_NODE
      ? sel.anchorNode.parentElement
      : (sel.anchorNode as HTMLElement);

  const li = element?.closest("li");
  const ul = element?.closest("ul, ol");
  if (!li || !ul || li.textContent?.trim() !== "") return false;

  e.preventDefault();
  const p = document.createElement("p");
  p.innerHTML = "<br>";
  ul.parentNode?.insertBefore(p, ul.nextSibling);
  li.remove();
  if (!ul.querySelector("li")) ul.remove();
  focusNode(p);
  return true;
}

export function handleListBackspace(e: React.KeyboardEvent) {
  if (e.key !== "Backspace") return false;

  const sel = window.getSelection();
  if (!sel?.anchorNode) return false;

  const element =
    sel.anchorNode.nodeType === Node.TEXT_NODE
      ? sel.anchorNode.parentElement
      : (sel.anchorNode as HTMLElement);

  const li = element?.closest("li");
  const ul = element?.closest("ul, ol");
  if (!li || !ul) return false;

  const range = sel.getRangeAt(0);
  const atStart =
    range.startOffset === 0 &&
    range.collapsed &&
    range.startContainer === li.firstChild;

  if (!atStart) return false;

  e.preventDefault();
  const p = document.createElement("p");
  p.innerHTML = li.innerHTML || "<br>";
  ul.parentNode?.insertBefore(p, ul.nextSibling);
  li.remove();
  if (!ul.querySelector("li")) ul.remove();
  focusNode(p);
  return true;
}

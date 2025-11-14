import { focusNode } from "../helpers/domHelpers";

export function handleQuoteEnter(e: React.KeyboardEvent) {
  if (e.key !== "Enter" || e.shiftKey) return false;

  const sel = window.getSelection();
  if (!sel?.rangeCount) return false;
  const range = sel.getRangeAt(0);

  const element =
    sel.anchorNode?.nodeType === Node.TEXT_NODE
      ? sel.anchorNode.parentElement
      : (sel.anchorNode as HTMLElement);

  const quote = element?.closest("blockquote");
  if (!quote) return false;

  e.preventDefault();

  const content = quote.innerText.replace(/\u200B/g, "").trim();
  const isEmpty = content === "";

  if (isEmpty) {
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    quote.parentNode?.insertBefore(p, quote);
    quote.remove();
    focusNode(p);
    return true;
  }

  const preRange = document.createRange();
  preRange.selectNodeContents(quote);
  preRange.setEnd(range.startContainer, range.startOffset);
  const atStart = preRange.toString().replace(/\u200B/g, "").trim() === "";

  const postRange = document.createRange();
  postRange.selectNodeContents(quote);
  postRange.setStart(range.endContainer, range.endOffset);
  const atEnd = postRange.toString().replace(/\u200B/g, "").trim() === "";

  const p = document.createElement("p");
  p.innerHTML = "<br>";

  if (atStart) {
    quote.parentNode?.insertBefore(p, quote);
    focusNode(p);
    return true;
  }

  if (atEnd) {
    quote.parentNode?.insertBefore(p, quote.nextSibling);
    focusNode(p);
    return true;
  }

  return false;
}

export function handleQuoteShiftEnter(e: React.KeyboardEvent) {
  if (e.key !== "Enter" || !e.shiftKey) return false;

  const sel = window.getSelection();
  if (!sel?.rangeCount) return false;
  const range = sel.getRangeAt(0);

  const element =
    sel.anchorNode?.nodeType === Node.TEXT_NODE
      ? sel.anchorNode.parentElement
      : (sel.anchorNode as HTMLElement);

  const quote = element?.closest("blockquote");
  if (!quote) return false;

  e.preventDefault();

  const br = document.createElement("br");
  const marker = document.createTextNode("\u200B");

  if (!quote.contains(range.startContainer)) {
    quote.appendChild(br);
    quote.appendChild(marker);
  } else {
    range.insertNode(br);
    range.collapse(false);
    range.insertNode(marker);
  }

  const newRange = document.createRange();
  newRange.setStartAfter(marker);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
  quote.normalize();

  return true;
}

export function handleQuoteBackspace(e: React.KeyboardEvent) {
  if (e.key !== "Backspace") return false;

  const sel = window.getSelection();
  if (!sel?.anchorNode) return false;

  const element =
    sel.anchorNode.nodeType === Node.TEXT_NODE
      ? sel.anchorNode.parentElement
      : (sel.anchorNode as HTMLElement);

  const quote = element?.closest("blockquote");
  if (!quote) return false;

  setTimeout(() => {
    const text = quote.innerText.replace(/\u200B/g, "").trim();
    if (text === "") {
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      quote.parentNode?.insertBefore(p, quote);
      quote.remove();
      focusNode(p);
    }
  }, 0);

  return false;
}

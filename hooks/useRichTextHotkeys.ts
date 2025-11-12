"use client";
import { useCallback } from "react";

// --- helpers reutilizables ---
const focusNode = (target: HTMLElement) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(target);
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
  target.focus();
};

const replaceLineWith = (line: HTMLElement, block: HTMLElement, node: HTMLElement) => {
  if (line === block) {
    block.innerHTML = "";
    block.appendChild(node);
  } else {
    line.replaceWith(node);
  }
};

// --- secciones por tipo de evento ---
function handleFormatHotkeys(e: React.KeyboardEvent, block: HTMLDivElement) {
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

function handleListBackspace(e: React.KeyboardEvent) {
  if (e.key !== "Backspace") return false;
  const selection = window.getSelection();
  if (!selection?.anchorNode) return false;

  const element =
    selection.anchorNode.nodeType === Node.TEXT_NODE
      ? selection.anchorNode.parentElement
      : (selection.anchorNode as HTMLElement);

  const li = element?.closest("li");
  const ul = element?.closest("ul, ol");
  if (!li || !ul) return false;

  const range = selection.getRangeAt(0);
  const atStart =
    range.startOffset === 0 && range.collapsed && range.startContainer === li.firstChild;

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

function handleListEnter(e: React.KeyboardEvent) {
  if (e.key !== "Enter") return false;
  const selection = window.getSelection();
  if (!selection?.anchorNode) return false;

  const element =
    selection.anchorNode.nodeType === Node.TEXT_NODE
      ? selection.anchorNode.parentElement
      : (selection.anchorNode as HTMLElement);

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

function handleLinePatterns(e: React.KeyboardEvent, block: HTMLDivElement) {
  if (e.key !== " ") return false;

  const selection = window.getSelection();
  const anchor = selection?.anchorNode;
  if (!anchor) return false;

  const element =
    anchor.nodeType === Node.TEXT_NODE
      ? anchor.parentElement
      : (anchor as HTMLElement);

  if (!element || element.closest("li, ul, ol, blockquote")) return false;

  // localizar línea
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

function handleQuoteEnter(e: React.KeyboardEvent) {
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

  // 1️⃣ Si está vacío: eliminar quote y crear párrafo
  if (isEmpty) {
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    quote.parentNode?.insertBefore(p, quote);
    quote.remove();
    focusNode(p);
    return true;
  }

  // 2️⃣ Detectar inicio y fin REALES del rango
  const preRange = document.createRange();
  preRange.selectNodeContents(quote);
  preRange.setEnd(range.startContainer, range.startOffset);
  const atStart = preRange.toString().replace(/\u200B/g, "").trim() === "";

  const postRange = document.createRange();
  postRange.selectNodeContents(quote);
  postRange.setStart(range.endContainer, range.endOffset);
  const atEnd = postRange.toString().replace(/\u200B/g, "").trim() === "";

  // 3️⃣ Crear nuevo párrafo en la posición adecuada
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

  // 4️⃣ En medio del quote → comportamiento normal (Shift+Enter maneja salto)
  return false;
}


function handleQuoteShiftEnter(e: React.KeyboardEvent) {
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

  // Crear un salto limpio dentro del quote
  const br = document.createElement("br");
  const marker = document.createTextNode("\u200B"); // invisible marker

  // Si el caret está fuera del quote, lo forzamos dentro
  if (!quote.contains(range.startContainer)) {
    quote.appendChild(br);
    quote.appendChild(marker);
  } else {
    range.insertNode(br);
    range.collapse(false);
    range.insertNode(marker);
  }

  // Recolocar el cursor después del marker
  const newRange = document.createRange();
  newRange.setStartAfter(marker);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  // Asegurar que el caret quede dentro del quote, no en un bloque nuevo
  quote.normalize();
  return true;
}

function handleQuoteBackspace(e: React.KeyboardEvent) {
  if (e.key !== "Backspace") return false;

  const sel = window.getSelection();
  if (!sel?.anchorNode) return false;

  const element =
    sel.anchorNode.nodeType === Node.TEXT_NODE
      ? sel.anchorNode.parentElement
      : (sel.anchorNode as HTMLElement);

  const quote = element?.closest("blockquote");
  if (!quote) return false;

  // Dejar que el DOM borre el caracter, luego chequear
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

// --- hook principal ---
export function useRichTextHotkeys(ref: React.RefObject<HTMLDivElement | null>) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const block = ref.current;
      if (!block) return;

      if (handleFormatHotkeys(e, block)) return;
      if (handleListBackspace(e)) return;
      if (handleListEnter(e)) return;
      if (handleLinePatterns(e, block)) return;
      if (handleQuoteShiftEnter(e)) return;
      if (handleQuoteEnter(e)) return;
      if (handleQuoteBackspace(e)) return;
    },
    [ref]
  );

  return { handleKeyDown };
}

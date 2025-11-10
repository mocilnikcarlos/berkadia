"use client";
import { useCallback } from "react";

export function useRichTextHotkeys(ref: React.RefObject<HTMLDivElement | null>) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const block = ref.current;
      if (!block) return;

      // --- ⚡️ FORMATO RÁPIDO (Ctrl+B / Ctrl+I / Ctrl+Shift+X / Ctrl+Shift+7/8)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        const cmd: Record<string, string> = {
          b: "bold",
          i: "italic",
          x: e.shiftKey ? "strikeThrough" : "",
          "7": e.shiftKey ? "insertOrderedList" : "",
          "8": e.shiftKey ? "insertUnorderedList" : "",
        };
        if (cmd[key]) {
          e.preventDefault();
          document.execCommand(cmd[key]);
        }
        return;
      }

      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;

      const anchor = selection.anchorNode;
      const element =
        anchor.nodeType === Node.TEXT_NODE
          ? anchor.parentElement
          : (anchor as HTMLElement);
      if (!element) return;

      // ---------- BACKSPACE: salir de lista al inicio del <li> ----------
      if (e.key === "Backspace") {
        const li = element.closest("li");
        const ul = element.closest("ul, ol");
        if (li && ul) {
          const range = selection.getRangeAt(0);
          const atStart =
            range.startOffset === 0 &&
            range.collapsed &&
            range.startContainer === li.firstChild;

          if (atStart) {
            e.preventDefault();
            const p = document.createElement("p");
            p.innerHTML = li.innerHTML || "<br>";
            ul.parentNode?.insertBefore(p, ul.nextSibling);
            li.remove();
            if (ul.querySelectorAll("li").length === 0) ul.remove();

            const r = document.createRange();
            r.selectNodeContents(p);
            r.collapse(true);
            selection.removeAllRanges();
            selection.addRange(r);
            p.focus();
          }
        }
        return;
      }

      // ---------- ENTER: salir de lista si el <li> está vacío ----------
      if (e.key === "Enter") {
        const li = element.closest("li");
        const ul = element.closest("ul, ol");
        if (li && ul && li.textContent?.trim() === "") {
          e.preventDefault();
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          ul.parentNode?.insertBefore(p, ul.nextSibling);
          li.remove();
          if (ul.querySelectorAll("li").length === 0) ul.remove();

          const r = document.createRange();
          r.selectNodeContents(p);
          r.collapse(true);
          selection.removeAllRanges();
          selection.addRange(r);
          p.focus();
        }
        return;
      }

      // ---------- ESPACIO: atajos "- ", "1. ", "> " ----------
      if (e.key === " ") {
        // No hacer nada si ya estamos dentro de lista o blockquote
        if (element.closest("li, ul, ol, blockquote")) return;

        // 1) Encontrar el "contenedor de línea" dentro del bloque
        let line: HTMLElement = element;
        while (
          line.parentElement &&
          line.parentElement !== block &&
          !["DIV", "P"].includes(line.tagName)
        ) {
          line = line.parentElement;
        }

        const lineText = (line.textContent || "").trim();

        const focusNode = (target: HTMLElement) => {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(target);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
          block.focus();
        };

        // helper para reemplazar SOLO esa línea
        const replaceLineWith = (node: HTMLElement) => {
          if (line === block) {
            // caso: el bloque solo tiene esta línea
            block.innerHTML = "";
            block.appendChild(node);
          } else {
            line.replaceWith(node);
          }
        };

        // --- Bullet list: "- " o "* " al inicio de la línea
        if (lineText === "-" || lineText === "*") {
          e.preventDefault();
          const ul = document.createElement("ul");
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          ul.appendChild(li);
          replaceLineWith(ul);
          setTimeout(() => focusNode(li), 0);
          return;
        }

        // --- Ordered list: "1." / "2." / etc al inicio de la línea
        if (/^\d+\.$/.test(lineText)) {
          e.preventDefault();
          const ol = document.createElement("ol");
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          ol.appendChild(li);
          replaceLineWith(ol);
          setTimeout(() => focusNode(li), 0);
          return;
        }

        // --- Blockquote: "> " al inicio de la línea
        if (lineText === ">") {
          e.preventDefault();
          const quote = document.createElement("blockquote");
          quote.innerHTML = "<br>";
          replaceLineWith(quote);
          setTimeout(() => focusNode(quote), 0);
          return;
        }
      }
    },
    [ref]
  );

  return { handleKeyDown };
}

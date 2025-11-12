export const focusNode = (target: HTMLElement) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(target);
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
  target.focus();
};

export const replaceLineWith = (
  line: HTMLElement,
  block: HTMLElement,
  node: HTMLElement
) => {
  if (line === block) {
    block.innerHTML = "";
    block.appendChild(node);
  } else {
    line.replaceWith(node);
  }
};

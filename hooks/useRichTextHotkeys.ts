import { useCallback } from "react";
import { handleFormatHotkeys } from "./handlers/formatHandlers";
import { handleListBackspace, handleListEnter } from "./handlers/listHandlers";
import { handleLinePatterns } from "./handlers/patternHandlers";
import { handleQuoteEnter, handleQuoteShiftEnter, handleQuoteBackspace } from "./handlers/quoteHandlers";

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

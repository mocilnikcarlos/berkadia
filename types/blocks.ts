// /types/blocks.ts

export type Block =
  | {
      id: string;
      type: "text";
      data: { html: string };
    }
  | {
      id: string;
      type: "quote";
      data: { html: string };
    }
  | {
      id: string;
      type: "list";
      data: { html: string };
    }
  | {
      id: string;
      type: "code";
      data: { html: string; language?: string };
    }
  | {
      id: string;
      type: "image";
      data: { url: string; alt?: string; caption?: string };
    }
  | {
      id: string;
      type: "audio";
      data: { url: string; title?: string };
    };

export type BlockType = Block["type"];

// Bloques que se comportan como texto enriquecido
export type TextLikeBlock = Extract<
  Block,
  { type: "text" | "quote" | "list" | "code" }
>;

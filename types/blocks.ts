// /types/blocks.ts

// /types/blocks.ts

// ------- TEXT BLOCKS -------
export interface TextBlock {
  id: string;
  type: "text";
  data: { html: string };
}

export interface QuoteBlock {
  id: string;
  type: "quote";
  data: { html: string };
}

export interface ListBlock {
  id: string;
  type: "list";
  data: { html: string };
}

export interface CodeBlock {
  id: string;
  type: "code";
  data: { html: string; language?: string };
}

// Agrupación de los que llevan HTML
export type TextLikeBlock =
  | TextBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock;


// ------- MEDIA BLOCKS -------
export interface ImageBlock {
  id: string;
  type: "image";
  data: {
    url: string;
    alt?: string;
    caption?: string;
    uploading?: boolean; // 👈 agregado
    error?: boolean;     // 👈 agregado
    storagePath?: string; // 👈 agregado
  };
}


export interface AudioBlock {
  id: string;
  type: "audio";
  data: { url: string; title?: string };
}

type ImageBlockData = {
  url?: string; // ahora opcional porque en "loading" todavía puede no estar
  alt?: string;
  caption?: string;
  storagePath?: string;

  // 🔥 NUEVOS CAMPOS
  status?: "loading" | "idle" | "error";
  file?: File;

  // (opcionales legacy, si los tenías)
  uploading?: boolean;
  error?: boolean;
};

// ------- UNION TOTAL -------
export type Block =
  | {
      id: string;
      type: "text";
      data: { html: string };
    }
  | {
      id: string;
      type: "image";
      data: ImageBlockData;
    }
  | TextBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | ImageBlock
  | AudioBlock;

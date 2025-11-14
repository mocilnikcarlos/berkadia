"use client";

import { addToast } from "@heroui/react";

export function showToast(
  title: string,
  description?: string,
  type: "default" | "success" | "error" = "default"
) {
  addToast({
    title,
    description,
    hideIcon: true, // porque queda más limpio con este estilo
    variant: "flat",

    classNames: {
      base: `
        rounded-xl
        px-4 py-3

        bg-gradient-to-b from-[#191919] to-[#1A1A1A]
        border border-white/10
        shadow-[0_4px_12px_rgba(0,0,0,0.35)]
        
        text-white
        backdrop-blur-md
      `,
      title: "text-white font-semibold",
      description: "text-white/80 text-sm",
      closeButton: "text-white hover:bg-white/10",
    },

    color:
      type === "error" ? "danger" : type === "success" ? "success" : "default",

    shouldShowTimeoutProgress: false,
  });
}

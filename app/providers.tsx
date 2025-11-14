"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@heroui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <HeroUIProvider>
        <UserProvider>
          <ToastProvider placement="top-center" maxVisibleToasts={3} />
          {children}
        </UserProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}

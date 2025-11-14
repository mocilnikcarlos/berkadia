"use client";
import { Button } from "@heroui/react";
import { getGreeting } from "@/lib/getGreeting";
import { useUserName } from "@/hooks/useUserName";

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export function DashboardHeader({ onLogout }: Props) {
  const { firstName } = useUserName();
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">
        {getGreeting()}, <span className="text-primary">{firstName}</span>
      </h1>
      <Button variant="flat" color="danger" onPress={onLogout}>
        Cerrar sesión
      </Button>
    </header>
  );
}

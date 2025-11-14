"use client";
import { Button } from "@heroui/react";

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export function DashboardHeader({ userEmail, onLogout }: Props) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">
        Bienvenido, <span className="text-primary">{userEmail}</span>
      </h1>
      <Button variant="flat" color="danger" onPress={onLogout}>
        Cerrar sesión
      </Button>
    </header>
  );
}

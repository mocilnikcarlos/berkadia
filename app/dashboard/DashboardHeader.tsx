"use client";

interface Props {
  userEmail: string;
  onLogout: () => void;
}

export function DashboardHeader({ userEmail, onLogout }: Props) {
  return (
    <header className="dashboard-header">
      <h1>
        Bienvenido, <em>{userEmail}</em>
      </h1>
      <button onClick={onLogout}>Cerrar sesión</button>
    </header>
  );
}

// /components/ui/BlockMenu.tsx
"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Trash2, MoreVertical } from "lucide-react";

interface Props {
  onDelete: () => void;
  setMenuOpen: (open: boolean) => void;
}

export default function BlockMenu({ onDelete, setMenuOpen }: Props) {
  const iconClass = "w-4 h-4 opacity-70";

  return (
    <Dropdown placement="bottom-end" onOpenChange={setMenuOpen}>
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="full"
          size="sm"
          variant="light"
          className="
            absolute right-[-48px] top-[0px]
            flex items-center gap-2
            opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Opciones del bloque"
        variant="faded"
        classNames={{
          base: `
            bg-gradient-to-b from-[#191919] to-[#1A1A1A]
            rounded-xl
          `,
        }}
      >
        <DropdownItem
          key="delete"
          color="danger"
          className="text-danger"
          classNames={{
            description: "text-gray-400",
          }}
          description="Eliminar este bloque"
          startContent={<Trash2 className={`${iconClass} text-danger`} />}
          onPress={onDelete}
        >
          Eliminar bloque
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

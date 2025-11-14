"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="text-lg font-semibold text-danger">
              ¿Eliminar nota?
            </ModalHeader>

            <ModalBody>
              <p className="text-default-600">
                Esta acción no se puede deshacer. ¿Seguro que querés eliminarla
                permanentemente?
              </p>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={close}>
                Cancelar
              </Button>
              <Button color="danger" onPress={onConfirm}>
                Eliminar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

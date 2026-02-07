"use client";

import { Modal as HeroModal, Button } from "@heroui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger"
}: ModalProps) => {
  const getConfirmVariant = () => {
    switch (type) {
      case "danger":
        return "danger";
      case "warning":
        return "secondary";
      case "info":
        return "primary";
      default:
        return "danger";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <HeroModal>
      <HeroModal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
        isDismissable
      >
        <HeroModal.Container>
          <HeroModal.Dialog>
            <HeroModal.Header>
              <HeroModal.Heading>{title}</HeroModal.Heading>
            </HeroModal.Header>
            <HeroModal.Body>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </HeroModal.Body>
            <HeroModal.Footer>
              <Button variant="secondary" onPress={onClose}>
                {cancelText}
              </Button>
              <Button variant={getConfirmVariant()} onPress={handleConfirm}>
                {confirmText}
              </Button>
            </HeroModal.Footer>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  );
};

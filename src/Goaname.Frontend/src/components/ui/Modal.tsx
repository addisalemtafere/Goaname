import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({ open, onClose, children, maxWidthClass = 'max-w-[420px]' }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className={`w-full ${maxWidthClass}`} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

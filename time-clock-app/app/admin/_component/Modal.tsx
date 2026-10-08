"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  icon,
  title,
  subtitle,
  onClose,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <span>{icon}</span>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

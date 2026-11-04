"use client";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "btn primary",
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {pending && (
        <LoaderCircle className="spinner" size={16} aria-hidden="true" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

"use client";

import { useStore } from "@/context/store-context";

export default function FooterContactLink({
  className,
}: {
  className?: string;
}) {
  const { openContact } = useStore();
  return (
    <button
      onClick={openContact}
      className={`${className ?? ""} cursor-pointer bg-transparent text-left`}
    >
      Contacto
    </button>
  );
}

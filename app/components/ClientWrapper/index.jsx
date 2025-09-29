"use client";

import { useEffect } from "react";

export default function ClientWrapper({ children }) {
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  return <>{children}</>;
}

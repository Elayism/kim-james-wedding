"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && showLoader && <LoadingScreen onLoaded={() => setIsLoading(false)} />}
      <div
        className={
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-500 ease-out"
        }
      >
        {children}
      </div>
    </>
  );
}

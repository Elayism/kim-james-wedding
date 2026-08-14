"use client";

import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onLoaded={() => setIsLoading(false)} />}
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

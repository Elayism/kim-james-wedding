"use client";

import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onLoaded={() => setIsLoading(false)} />}
      <div
        className={`transition-all duration-700 ease-out ${
          isLoading ? "blur-sm scale-[0.99]" : "blur-0 scale-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}

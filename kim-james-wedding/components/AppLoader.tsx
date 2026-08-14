"use client";

import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onLoaded={() => setLoaded(true)} />}
      <div
        className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      >
        {children}
      </div>
    </>
  );
}

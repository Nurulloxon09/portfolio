"use client";

import dynamic from "next/dynamic";
import "./scene.css";

const DeskScene = dynamic(() => import("./DeskScene"), {
  ssr: false,
  loading: () => <div className="desk-scene" />,
});

export function DeskSceneLoader({ osUrl }: { osUrl: string }) {
  return <DeskScene osUrl={osUrl} />;
}

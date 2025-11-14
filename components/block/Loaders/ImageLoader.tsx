"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useState } from "react";

interface Props {
  size?: number;
}

export default function ImageLoader({ size = 120 }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex items-center justify-center h-[180px] w-full bg-transparent rounded-lg border border-neutral-700">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-neutral-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[180px] w-full bg-transparent rounded-lg">
      <DotLottieReact
        src="https://lottie.host/20667603-8fef-405b-bd45-5e31dfd9cdd5/NRJY2T3VSA.lottie"
        loop
        autoplay
        className="w-[140px] h-[140px]"
        onError={() => setFailed(true)}
        style={{
          background: "transparent",
        }}
      />
    </div>
  );
}

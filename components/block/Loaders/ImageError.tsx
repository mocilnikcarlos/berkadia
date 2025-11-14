"use client";

interface Props {
  onRetry: () => void;
}

export default function ImageError({ onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-[180px] w-full bg-red-50 border border-red-300 rounded-lg">
      <p className="text-red-600 text-sm">No se pudo subir la imagen</p>
      <button
        className="mt-2 text-xs font-semibold underline text-red-700"
        onClick={onRetry}
      >
        Reintentar
      </button>
    </div>
  );
}

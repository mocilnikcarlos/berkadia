"use client";
import { useEffect, useState } from "react";

interface Props {
  url: string; // endpoint a consultar
}

export default function JsonViewer({ url }: Props) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return (
    <div className="p-4 bg-black/30 rounded-lg text-sm">
      <h2 className="text-lg font-semibold mb-2">JSON Viewer</h2>

      {loading && <p className="text-yellow-400">Cargando...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {data && (
        <pre className="whitespace-pre-wrap text-green-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

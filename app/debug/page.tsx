import JsonViewer from "@/components/debug/JsonViewer";

export default function Page() {
  return <JsonViewer url="/api/auth/session" />;
}

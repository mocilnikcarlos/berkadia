"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export function useEditorUser() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data?.user) setUserId(data.user.id);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return userId;
}

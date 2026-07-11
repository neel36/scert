"use client";

import * as React from "react";
import { adminCheck } from "@/lib/api";
import { AdminLogin } from "./admin-login";
import { AdminShell } from "./admin-shell";
import { Loader2 } from "lucide-react";

export function AdminPanel() {
  const [checking, setChecking] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    adminCheck()
      .then((ok) => {
        if (active) {
          setAuthed(ok);
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) {
          setAuthed(false);
          setChecking(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">प्रमाणीकरण जाँच हो रहा है…</span>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminShell onLogout={() => setAuthed(false)} />;
}

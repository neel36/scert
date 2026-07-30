"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      toast.error("पासवर्ड दर्ज करें");
      return;
    }
    setLoading(true);
    try {
      const ok = await adminLogin(password);
      if (ok) {
        toast.success("लॉगिन सफल");
        onSuccess();
      } else {
        toast.error("गलत पासवर्ड");
        setPassword("");
      }
    } catch {
      toast.error("लॉगिन विफल");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] place-items-center p-4">
      <Card className="w-full max-w-md overflow-hidden border-none shadow-xl">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-8 text-center text-primary-foreground">
          <img
            src="/app-icon.png"
            alt="CG Board"
            className="mx-auto mb-3 h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-white/40"
          />
          <h1 className="text-xl font-bold tracking-tight">
            BOOKS AND NOTES CG BOARD
          </h1>
          <p className="mt-1 text-sm text-emerald-100">एडमिन कंट्रोल पैनल</p>
        </div>
        <CardContent className="space-y-4 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pwd" className="text-sm font-medium">
                एडमिन पासवर्ड
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pwd"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              लॉगिन करें
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface ExitDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ExitDialog({ open, onOpenChange }: ExitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <LogOut className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center">ऐप से बाहर निकलें?</DialogTitle>
          <DialogDescription className="text-center">
            क्या आप वाकई "BOOKS AND NOTES CG BOARD" ऐप बंद करना चाहते हैं? आप
            कभी भी वापस आ सकते हैं।
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            रहने दें
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-1.5"
            onClick={() => {
              onOpenChange(false);
              // In a real native app this would close the app.
              // On web, we show a goodbye screen.
              if (typeof window !== "undefined") {
                document.body.innerHTML =
                  '<div style="display:flex;min-height:100vh;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:linear-gradient(135deg,#059669,#0f766e);color:#fff;font-family:system-ui;padding:24px;text-align:center"><div style="font-size:48px">📚</div><h1 style="font-size:22px;font-weight:800;margin:0">धन्यवाद!</h1><p style="margin:0;opacity:.9;font-size:14px">आपने ऐप से बाहर निकला है। ब्राउज़र टैब बंद करें या पेज रीफ्रेश करें।</p></div>';
              }
            }}
          >
            <LogOut className="h-4 w-4" /> एक्जिट
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

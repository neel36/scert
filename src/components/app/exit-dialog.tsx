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

import { App as CapacitorApp } from "@capacitor/app";

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
            क्या आप वाकई "BOOKS AND NOTES CG BOARD" ऐप बंद करना चाहते हैं?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            रहने दें
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-1.5"
            onClick={async () => {
              try {
                await CapacitorApp.exitApp();
              } catch (e) {
                console.log("CapacitorApp.exitApp failed or not native", e);
              }
              if (typeof window !== "undefined") {
                try {
                  window.close();
                } catch (e) {}
              }
              onOpenChange(false);
            }}
          >
            <LogOut className="h-4 w-4" /> एक्जिट
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

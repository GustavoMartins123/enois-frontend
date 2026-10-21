import { useState } from "react";

import { Loader2 } from "lucide-react";

import { texts } from "@/texts";
import { ApiError } from "@/lib/api-client";
import { profileApi } from "@/lib/api/profile";
import { useBirthDateGateStore } from "@/stores/birth-date-gate.store";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BirthDateDialog() {
  const { open, hide } = useBirthDateGateStore();
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setBirthDate("");
    setError(null);
    setSaving(false);
  };

  const submit = async () => {
    if (!birthDate) {
      setError(texts.birthDate.required);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await profileApi.declareBirthDate(birthDate);
      reset();
      hide();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : texts.birthDate.error,
      );
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          hide();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-normal text-text-strong">
            {texts.birthDate.title}
          </DialogTitle>
          <DialogDescription>
            {texts.birthDate.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="birthDate">{texts.birthDate.label}</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            className="w-full rounded-full"
            disabled={saving || !birthDate}
            onClick={submit}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              texts.birthDate.action
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

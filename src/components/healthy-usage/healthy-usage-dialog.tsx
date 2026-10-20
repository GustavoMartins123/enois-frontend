import { useEffect, useState } from "react";

import { texts } from "@/texts";
import { HeartPulse } from "lucide-react";

import {
  HEALTHY_USAGE_MAX_MINUTES,
  HEALTHY_USAGE_MIN_MINUTES,
  clampMinutes,
  readHealthyUsage,
  writeHealthyUsage,
} from "@/lib/healthy-usage";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

export function HealthyUsageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    if (!open) return;
    const config = readHealthyUsage();
    setEnabled(config.enabled);
    setMinutes(config.minutes);
  }, [open]);

  const save = () => {
    writeHealthyUsage({ enabled, minutes: clampMinutes(minutes) });
    toast(texts.account.healthyUsage.saved, "success");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-normal">
            <HeartPulse className="h-5 w-5 text-primary" />

            <>{texts.account.healthyUsage.title}</>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground">{texts.account.healthyUsage.description}</p>

          <label className="flex items-start justify-between gap-3 rounded-2xl border border-border-soft bg-surface-card p-3">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text-strong">
                {texts.account.healthyUsage.switchLabel}
              </span>

              <span className="mt-0.5 block text-xs text-text-subtle">
                {texts.account.healthyUsage.switchHint}
              </span>
            </span>

            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-text-strong">
              {texts.account.healthyUsage.minutesLabel}
            </span>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={HEALTHY_USAGE_MIN_MINUTES}
                max={HEALTHY_USAGE_MAX_MINUTES}
                value={minutes}
                disabled={!enabled}
                onChange={(event) => setMinutes(Number(event.target.value))}
                className="w-28"
              />

              <span className="text-sm text-text-subtle">
                {texts.account.healthyUsage.minutesUnit}
              </span>
            </div>

            <span className="block text-xs text-text-subtle">
              {texts.account.healthyUsage.minutesHint}
            </span>
          </label>

          <div className="flex justify-end">
            <Button className="rounded-full" onClick={save}>
              {texts.account.healthyUsage.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

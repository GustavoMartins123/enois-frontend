import { useState } from "react";

import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { ReportReason } from "@/types/application/report/report-reason";
import type { PostIdProps } from "@/types/components/post/post-id-props";

import { REPORT_REASONS, reportsApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Denúncia de post. */
export function ReportDialog({ postId }: PostIdProps) {
  const open = usePostCardStore((state) => state.cards[postId]?.showReport ?? false);
  const setShowReport = usePostCardStore((state) => state.setShowReport);
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [description, setDescription] = useState("");

  const submit = async () => {
    try {
      await reportsApi.create({
        targetId: postId,
        targetType: "POST",
        reason,
        description: description || undefined,
      });
      setShowReport(postId, false);
      setDescription("");
    } catch {
      /* silent */
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setShowReport(postId, nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.posts.report.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">
              {texts.posts.report.reason}
            </Label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="flex h-10 w-full rounded-md border border-border-soft bg-background px-3 py-2 text-sm font-normal text-text-strong border-transparent bg-muted"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r} className="h-10 border-transparent bg-muted">
                  {r.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">
              {texts.posts.report.description}
            </Label>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-border-soft bg-surface-1 text-sm font-normal h-10 border-transparent bg-muted"
            />
          </div>

          <Button className="w-full rounded-full" onClick={submit}>
            {texts.posts.report.action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

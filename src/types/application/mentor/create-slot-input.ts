import type { TimeSlot } from "./time-slot";

export type CreateSlotInput = Pick<TimeSlot, "startsAt" | "endsAt">;

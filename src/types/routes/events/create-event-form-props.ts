import type { CreateEventRequest } from "@/types/application/event/create-event-request";

export type CreateEventFormProps = {
  onSave: (data: Omit<CreateEventRequest, "cover">) => void;
  isPending: boolean;
};

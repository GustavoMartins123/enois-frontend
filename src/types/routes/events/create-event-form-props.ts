import type { CreateEventRequest } from "@/types/application/event/create-event-request";

export type CreateEventFormProps = {
  onSave: (data: CreateEventRequest) => void;
  isPending: boolean;
};

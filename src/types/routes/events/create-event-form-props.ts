import type { CreateEventFormData } from "./create-event-form-data";

export type CreateEventFormProps = {
  onSave: (data: CreateEventFormData) => void;
  isPending: boolean;
};

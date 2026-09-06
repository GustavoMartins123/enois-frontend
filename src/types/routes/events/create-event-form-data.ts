import type { CreateEventRequest } from "@/types/application/event/create-event-request";

export type CreateEventFormData = Omit<CreateEventRequest, "cover">;

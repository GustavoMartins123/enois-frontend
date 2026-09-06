import type { CreateMentorInput } from "@/types/application/mentor/create-mentor-input";

export type RegisterMentorFormProps = {
  onSave: (data: CreateMentorInput) => void;
  isPending: boolean;
};

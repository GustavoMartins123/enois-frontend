export type GameReviewView = {
  id: string;
  userId: string;
  username: string | null;
  title: string;
  description: string;
  cover: string;
  url: string;
  tags: string;
  aspect: string | null;
  submittedAt: string | null;
};

import { texts } from "@/texts";
import type { PostView } from "@/types/application/feed/post-view";
import type { PostTypeMeta } from "@/types/components/post/post-type-meta";

export const typeMeta: Record<PostView["type"], PostTypeMeta> = {
  INSIGHT: {
    label: texts.posts.types.insight,
    className: "bg-highlight-insight text-highlight-insight-text",
    classAvatar: "bg-user-insight text-highlight-insight-text",
  },
  QUESTION: {
    label: texts.posts.types.question,
    className: "bg-secondary/30 text-secondary-foreground",
    classAvatar: "",
  },
  PROJECT: {
    label: texts.posts.types.project,
    className: "bg-highlight-project text-highlight-project-text",
    classAvatar: "bg-user-project text-user-project-text",
  },
  OPPORTUNITY: {
    label: texts.posts.types.opportunity,
    className: "bg-opportunity/20 text-opportunity-foreground",
    classAvatar: "",
  },
  ARTICLE: {
    label: texts.posts.types.article,
    className: "bg-highlight-article text-highlight-article-text",
    classAvatar: "bg-user-article text-user-article-text",
  },
  NEWS: {
    label: texts.posts.types.news,
    className: "bg-highlight-article text-highlight-article-text",
    classAvatar: "",
  },
  TUTORIAL: {
    label: texts.posts.types.tutorial,
    className: "bg-highlight-insight text-highlight-insight-text",
    classAvatar: "",
  },
  REVIEW: {
    label: texts.posts.types.review,
    className: "bg-opportunity/20 text-opportunity-foreground",
    classAvatar: "",
  },
  MOMENT: {
    label: texts.posts.types.moment,
    className: "bg-secondary/30 text-secondary-foreground",
    classAvatar: "",
  },
  DIVERTIDO: {
    label: texts.posts.types.divertido,
    className: "bg-accent text-accent-foreground",
    classAvatar: "",
  },
  PAGE: {
    label: texts.posts.types.page,
    className: "bg-surface-2 text-text-strong",
    classAvatar: "",
  },
  BLOG: {
    label: texts.blog.feed.badge,
    className: "bg-highlight-article text-highlight-article-text",
    classAvatar: "bg-user-article text-article-text",
  },
};

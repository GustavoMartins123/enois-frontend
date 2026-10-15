import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ArrowLeft, Loader2 } from "lucide-react";

import { feedApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";

import { AppContainer } from "@/components/app-container";
import { PostCard } from "@/components/post-card";

export const Route = createFileRoute("/post/$postId")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.post.seoTitle }] }),
  component: PostDetail,
});

function PostDetail() {
  const { postId } = Route.useParams();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => feedApi.get(postId),
  });

  return (
    <AppContainer>
      <div className="space-y-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.post.back}</>
        </Link>

        {isLoading ? (
          <div className="surface-card p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />

            <p className="mt-3 text-sm text-muted-foreground">{texts.post.loading}</p>
          </div>
        ) : isError || !post ? (
          <div className="surface-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{texts.post.notFound}</p>
          </div>
        ) : (
          <PostCard post={post} />
        )}
      </div>
    </AppContainer>
  );
}

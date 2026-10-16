import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ArrowLeft, Loader2 } from "lucide-react";

import { feedApi } from "@/lib/api";

import { AppContainer } from "@/components/app-container";
import { PostCard } from "@/components/post-card";
import { RichText } from "@/components/post/rich-text";

export const Route = createFileRoute("/post/$postId")({
  // Sem `beforeLoad: requireAuth`: o post e o destino do link compartilhado e precisa abrir para
  // quem recebeu. As acoes (reagir, comentar, salvar, compartilhar) e que pedem login.

  head: () => ({ meta: [{ title: texts.post.seoTitle }] }),
  component: PostDetail,
});

function PostDetail() {
  const { postId } = Route.useParams();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
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
          <>
            <PostCard post={post} />

            {/* Artigo: o corpo vem so na leitura do post unico (a listagem traz o resumo), entao e
                aqui que ele aparece — na mesma largura de leitura do resto. */}
            {post.articleBody && (
              <article className="surface-card p-5 sm:p-8">
                <h2 className="mb-4 text-lg font-normal text-text-strong">
                  {texts.feed.composer.article.bodyLabel}
                </h2>

                <RichText
                  content={post.articleBody}
                  className="whitespace-pre-line break-words text-base font-normal leading-relaxed text-text-strong"
                />
              </article>
            )}
          </>
        )}
      </div>
    </AppContainer>
  );
}

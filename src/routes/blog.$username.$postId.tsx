import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ArrowLeft } from "lucide-react";

import { blogsApi } from "@/lib/api/blogs";
import { resolveCdnUrl } from "@/lib/api/media";
import { buildShareTags } from "@/lib/open-graph";

import { AppContainer } from "@/components/app-container";
import { RichText } from "@/components/post/rich-text";
import { SandboxedHtmlFrame } from "@/components/post/sandboxed-html-frame";
import { UserAvatar } from "@/components/user-avatar";

export const Route = createFileRoute("/blog/$username/$postId")({
  loader: async ({ params }) => {
    try {
      const blog = await blogsApi.get(params.username);
      const post = blog.items.find((item) => item.id === params.postId);
      if (!post) {
        throw notFound();
      }
      return { blog, post };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData, params }) => ({
    meta: buildShareTags({
      title: loaderData
        ? `${loaderData.post.title} · ${loaderData.blog.title}`
        : texts.blog.seoFallbackTitle,
      description:
        loaderData?.blog.description ||
        texts.blog.seoDescription(loaderData?.blog.authorName ?? params.username),
      url: `${texts.siteUrl}/blog/${encodeURIComponent(params.username)}/${encodeURIComponent(params.postId)}`,
      imageUrl:
        resolveCdnUrl(loaderData?.blog.authorAvatar) || `${texts.siteUrl}/icons/icon-512.png`,
      imageAlt: loaderData
        ? `${loaderData.post.title} · blog ${loaderData.blog.title}`
        : texts.blog.seoFallbackTitle,
    }),
  }),
  notFoundComponent: () => (
    <AppContainer>
      <div className="surface-card p-10 text-center">
        <p className="text-base font-normal text-text-strong">{texts.posts.page.loading}</p>

        <Link
          to="/blogs"
          className="mt-2 inline-block text-sm font-normal text-primary hover:underline"
        >
          {texts.blog.backToBlogs}
        </Link>
      </div>
    </AppContainer>
  ),
  component: BlogPostPage,
});

/**
 * Um post do blog.
 *
 * Markdown vira texto formatado (o mesmo parser do feed, sem innerHTML em lugar nenhum); HTML/CSS
 * roda no quadro isolado das páginas e da bio. O post é público — é o link que a pessoa compartilha.
 */
function BlogPostPage() {
  const { username } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const { data } = useQuery({
    queryKey: ["blog", username],
    queryFn: () => blogsApi.get(username),
    initialData: loaderData.blog,
    staleTime: 0,
  });

  const blog = data ?? loaderData.blog;
  const post = blog.items.find((item) => item.id === loaderData.post.id) ?? loaderData.post;

  return (
    <AppContainer>
      <div className="space-y-6">
        <Link
          to="/blog/$username"
          params={{ username: blog.slug }}
          className="inline-flex items-center gap-1.5 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />

          <>{blog.title}</>
        </Link>

        <article className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
          <header className="border-b border-border-soft p-5 sm:p-6">
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong">{post.title}</h1>

            <Link
              to="/perfil/$username"
              params={{ username: blog.authorUsername }}
              className="mt-3 inline-flex items-center gap-2"
            >
              <UserAvatar
                src={blog.authorAvatar}
                alt={blog.authorName}
                className="h-7 w-7 shrink-0"
              />

              <span className="text-xs font-normal text-text-subtle">
                {blog.authorName} ·{" "}
                {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </Link>
          </header>

          {post.bodyFormat === "HTML" ? (
            <SandboxedHtmlFrame
              html={post.body}
              title={post.title}
              className="h-[70vh] w-full rounded-none border-0 bg-transparent shadow-none"
              innerPadding={false}
            />
          ) : (
            <div className="p-5 sm:p-8">
              <RichText
                content={post.body}
                className="whitespace-pre-line break-words text-base font-normal leading-relaxed text-text-strong"
              />
            </div>
          )}
        </article>
      </div>
    </AppContainer>
  );
}

import { type FormEvent, useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BarChart3,
  Bold,
  Bookmark,
  Calendar,
  Camera,
  FileText,
  Flag,
  Heart,
  Image,
  Italic,
  Link2,
  Loader2,
  MessageCircle,
  Paperclip,
  Play,
  Repeat2,
  Send,
  Share2,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";

import { AppShell, Avatar } from "../../components/AppShell";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { commentsApi, eventsApi, feedApi, networkApi, reactionsApi } from "../../lib/api";
import type { CommentView, PostView } from "../../lib/api";

const POST_TYPES = [
  { key: "INSIGHT", label: "Insight", icon: Image },
  { key: "ARTICLE", label: "Artigo", icon: FileText },
  { key: "QUESTION", label: "Pergunta", icon: BarChart3 },
  { key: "PROJECT", label: "Projeto", icon: Calendar },
  { key: "MEDIA", label: "Mídia", icon: Video },
] as const;

const FILTER_CHIPS = [
  { key: null, label: "Todos" },
  { key: "INSIGHT", label: "Insight" },
  { key: "ARTICLE", label: "Artigo" },
  { key: "QUESTION", label: "Pergunta" },
  { key: "PROJECT", label: "Projeto" },
  { key: "MEDIA", label: "Mídia" },
] as const;

const EMOJIS = [
  "👋",
  "🚀",
  "💡",
  "🎯",
  "💪",
  "🔥",
  "✅",
  "⚡",
  "🌟",
  "🤝",
  "💻",
  "📊",
  "🎉",
  "🙌",
  "👀",
  "💬",
];

function postViewToLocal(p: PostView): LocalPost {
  return {
    id: p.id,
    authorName: p.authorName,
    authorUsername: p.authorUsername,
    authorAvatar: p.authorAvatar,
    type: (p.type === "OPPORTUNITY" ? "PROJECT" : p.type) as PostType,
    content: p.content,
    createdAt: p.createdAt,
    reactions: p.counters.reactions,
    comments: p.counters.comments,
    saves: p.counters.saves,
    hasVideo: p.mediaIds.length > 0,
    currentUserReaction: p.currentUserReaction,
  };
}

type PostType = (typeof POST_TYPES)[number]["key"];

interface Comment {
  id: string;
  author: string;
  avatar: string | null;
  text: string;
}

interface LocalPost {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  type: PostType;
  content: string;
  createdAt: string;
  reactions: number;
  comments: number;
  saves: number;
  communityName?: string;
  hasVideo?: boolean;
  currentUserReaction?: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  INSIGHT: "Insight",
  ARTICLE: "Artigo",
  QUESTION: "Pergunta",
  PROJECT: "Projeto",
  MEDIA: "Mídia",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function PostContent({ content, className }: { content: string; className?: string }) {
  const isHtml = /<[a-zA-Z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className={`${className ?? ""} text-[15px] font-light leading-relaxed text-[#0f0f14] dark:text-[#e8e6ff] [&_h1]:text-[19px] [&_h1]:font-semibold [&_h1]:leading-snug [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:leading-snug [&_b]:font-semibold [&_strong]:font-semibold [&_em]:italic [&_i]:italic [&>*+*]:mt-1`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p
      className={`${className ?? ""} text-[15px] font-light leading-relaxed text-[#0f0f14] whitespace-pre-wrap dark:text-[#e8e6ff]`}
    >
      {content}
    </p>
  );
}

function ConfirmDeleteModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E0EB] bg-white p-6 shadow-xl dark:border-[#2a2a3d] dark:bg-[#13131f]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <p className="mt-3 text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{message}</p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">Essa ação não pode ser desfeita.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-[#E5E0EB] px-5 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-red-500 px-5 py-2 text-[13px] font-light text-white transition hover:bg-red-600"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PostComposerModal ───────────────────────────────────────────────────── */
interface ComposerModalProps {
  user: { name?: string; username?: string; avatar?: string | null } | null;
  onClose: () => void;
  onPublish: (draft: string, type: PostType, videoFile: File | null) => void;
}

function PostComposerModal({ user, onClose, onPublish }: ComposerModalProps) {
  const [postType, setPostType] = useState<PostType>("INSIGHT");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editorRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  const handleInput = () => {
    const text = editorRef.current?.innerText ?? editorRef.current?.textContent ?? "";
    setCanPublish(text.trim().length > 0);
    setCharCount(text.length);
  };

  const applyFormat = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? undefined);
    setTimeout(handleInput, 0);
  };

  const insertEmoji = (emoji: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, emoji);
    setShowEmoji(false);
    setTimeout(handleInput, 0);
  };

  const handlePublish = () => {
    const html = editorRef.current?.innerHTML ?? "";
    const text = (editorRef.current?.innerText ?? editorRef.current?.textContent ?? "").trim();
    if (!text) return;
    onPublish(html, postType, videoFile);
    onClose();
  };

  const toolBtn =
    "grid h-7 w-7 place-items-center rounded-md text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]";
  const hdgBtn =
    "grid h-7 min-w-[28px] place-items-center rounded-md px-2 text-[12px] font-bold text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]";
  const sep = <div className="mx-0.5 h-4 w-px bg-[#E5E0EB] dark:bg-[#2a2a3d]" />;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white shadow-2xl dark:border-[#2a2a3d] dark:bg-[#13131f]"
        style={{ maxHeight: "90vh" }}
      >
        {/* Cabeçalho */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E0EB] px-5 py-4 dark:border-[#2a2a3d]">
          <p className="text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
            Nova publicação
          </p>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar ?? null} name={user?.name ?? "Você"} />
            <div>
              <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                {user?.name}
              </p>
              <p className="text-[12px] text-[#9CA3AF]">Publicar para todos</p>
            </div>
          </div>

          {/* Editor WYSIWYG */}
          <div className="relative mt-4 min-h-[144px]">
            {!canPublish && (
              <span
                className="pointer-events-none absolute inset-0 text-[15px] font-light text-[#9CA3AF]"
                aria-hidden="true"
              >
                O que você quer compartilhar?
              </span>
            )}
            <div
              ref={editorRef}
              role="textbox"
              aria-label="Conteúdo da publicação"
              aria-multiline="true"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handlePublish();
              }}
              className="relative min-h-[144px] w-full outline-none text-[15px] font-light leading-relaxed text-[#0f0f14] dark:text-[#e8e6ff] [&_h1]:text-[19px] [&_h1]:font-semibold [&_h1]:leading-snug [&_h2]:text-[16px] [&_h2]:font-semibold [&_b]:font-semibold [&_strong]:font-semibold [&_em]:italic [&_i]:italic"
            />
          </div>

          {videoFile && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F9F8FF] px-3 py-1.5 dark:bg-[#1e1e2e]">
              <Video className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
              <span className="flex-1 truncate text-[12px] text-[#6B7280]">{videoFile.name}</span>
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="text-lg leading-none text-[#9CA3AF] hover:text-red-400"
              >
                ×
              </button>
            </div>
          )}

          {postType === "MEDIA" && !videoFile && (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E0EB] py-8 transition hover:border-[#C4B5FD] dark:border-[#2a2a3d]"
            >
              <Video className="h-7 w-7 text-[#C4B5FD]" />
              <p className="mt-2 text-[13px] font-light text-[#9CA3AF]">
                Clique para adicionar um vídeo
              </p>
              <p className="text-[11px] text-[#C4B5FD]">MP4, MOV · até 3 minutos</p>
            </button>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setVideoFile(f);
            }}
          />

          {/* Toolbar de formatação */}
          <div className="mt-4 border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">
              Formatação
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                aria-label="Título H1"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("formatBlock", "h1")}
                className={hdgBtn}
              >
                H1
              </button>
              <button
                type="button"
                aria-label="Subtítulo H2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("formatBlock", "h2")}
                className={hdgBtn}
              >
                H2
              </button>
              {sep}
              <button
                type="button"
                aria-label="Negrito"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("bold")}
                className={toolBtn}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Itálico"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat("italic")}
                className={toolBtn}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              {sep}
              <div ref={emojiRef} className="relative">
                <button
                  type="button"
                  aria-label="Inserir emoji"
                  onClick={() => setShowEmoji((p) => !p)}
                  className="grid h-7 w-7 place-items-center rounded-md text-[16px] leading-none transition hover:bg-[#F5F3FF] dark:hover:bg-[#1e1e2e]"
                >
                  😊
                </button>
                {showEmoji && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-xl border border-[#E5E0EB] bg-white p-2 shadow-xl dark:border-[#2a2a3d] dark:bg-[#13131f]">
                    <div className="grid grid-cols-4 gap-1">
                      {EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => insertEmoji(em)}
                          className="grid h-7 w-7 place-items-center rounded-md text-[15px] leading-none transition hover:bg-[#F5F3FF] dark:hover:bg-[#1e1e2e]"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {sep}
              <button
                type="button"
                aria-label="Adicionar vídeo"
                onClick={() => videoInputRef.current?.click()}
                className={`${toolBtn} ${videoFile ? "text-[#7C3AED]!" : ""}`}
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Seleção de tipo */}
          <div className="mt-4 border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">
              Tipo de publicação
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POST_TYPES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPostType(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition ${
                    postType === key
                      ? "bg-[#7C3AED] text-white"
                      : "border border-[#E5E0EB] text-[#6B7280] hover:border-[#C4B5FD] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#E5E0EB] px-5 py-4 dark:border-[#2a2a3d]">
          <p className={`text-[12px] ${charCount > 800 ? "text-red-400" : "text-[#9CA3AF]"}`}>
            {charCount}/800
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-[#E5E0EB] px-4 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d]"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublish}
              disabled={!canPublish}
              className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-5 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" /> Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PostCard ────────────────────────────────────────────────────────────── */
function PostCard({
  post,
  isOwn,
  onDelete,
}: {
  post: LocalPost;
  isOwn: boolean;
  onDelete: () => void;
}) {
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();
  const qc = useQueryClient();

  const [liked, setLiked] = useState(() => !!post.currentUserReaction);
  const [saved, setSaved] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reply, setReply] = useState("");
  const [pendingDelete, setPendingDelete] = useState<null | "post" | string>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const { data: apiComments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => commentsApi.list(post.id),
    enabled: showComments,
    select: (r) => r.items,
  });

  const apiToComment = (c: CommentView): Comment => ({
    id: c.id,
    author: c.authorName,
    avatar: c.authorAvatar,
    text: c.content,
  });

  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const comments = [...(apiComments ?? []).map(apiToComment), ...localComments];

  const likeMut = useMutation({
    mutationFn: () =>
      liked ? reactionsApi.removeReaction(post.id) : reactionsApi.react(post.id, "LIKE"),
    onMutate: () => setLiked((p) => !p),
    onError: () => setLiked((p) => !p),
  });

  const saveMut = useMutation({
    mutationFn: () => (saved ? reactionsApi.removeSave(post.id) : reactionsApi.save(post.id)),
    onMutate: () => setSaved((p) => !p),
    onError: () => setSaved((p) => !p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-posts"] }),
  });

  const addCommentMut = useMutation({
    mutationFn: (text: string) => commentsApi.create(post.id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", post.id] }),
  });

  const deleteCommentMut = useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(post.id, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", post.id] }),
  });

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  const handleSaveToggle = () => {
    saveMut.mutate();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://conexao.app/post/${post.id}`);
    } catch {}
    setLinkCopied(true);
    addNotif("Link da publicação copiado para a área de transferência.", "post");
    setTimeout(() => {
      setLinkCopied(false);
      setShareOpen(false);
    }, 1800);
  };

  const handleRepost = () => {
    setShareOpen(false);
    addNotif("Publicação repostada no seu feed.", "post");
  };

  const submitReply = (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const text = reply.trim();
    setReply("");
    addCommentMut.mutate(text, {
      onError: () => {
        setLocalComments((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            author: user?.name ?? "Você",
            avatar: user?.avatar ?? null,
            text,
          },
        ]);
      },
    });
  };

  const handleConfirm = () => {
    if (pendingDelete === "post") onDelete();
    else if (pendingDelete) {
      const isLocalComment = localComments.some((c) => c.id === pendingDelete);
      if (isLocalComment) {
        setLocalComments((prev) => prev.filter((c) => c.id !== pendingDelete));
      } else {
        deleteCommentMut.mutate(pendingDelete);
      }
    }
    setPendingDelete(null);
  };

  return (
    <>
      {pendingDelete && (
        <ConfirmDeleteModal
          message={
            pendingDelete === "post"
              ? "Tem certeza que deseja apagar essa publicação?"
              : "Tem certeza que deseja apagar esse comentário?"
          }
          onConfirm={handleConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <article className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
        <div className="flex items-start gap-3">
          <Avatar src={post.authorAvatar} name={post.authorName} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                {post.authorName}
              </span>
              <span className="text-[12px] text-[#9CA3AF]">· {timeAgo(post.createdAt)}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
                {TYPE_LABEL[post.type] ?? post.type}
              </span>
              {post.communityName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE8F5] px-2 py-0.5 text-[11px] text-[#7C3AED] dark:bg-[#2d1f4e]">
                  <Users className="h-2.5 w-2.5" />
                  {post.communityName}
                </span>
              )}
            </div>
          </div>
          {isOwn && (
            <button
              onClick={() => setPendingDelete("post")}
              className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <PostContent content={post.content} className="mt-3" />

        {(post.type === "MEDIA" || post.hasVideo) && (
          <div className="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#0f0f14]">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20">
                <Play className="ml-0.5 h-6 w-6 fill-white/80 text-white/80" />
              </div>
              <p className="text-[11px] font-light text-white/40">Vídeo curto · simulado</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF] dark:border-[#1e1e2e]">
          <button
            aria-label="Curtir"
            onClick={() => likeMut.mutate()}
            className={`flex items-center gap-1.5 transition ${liked ? "text-[#7C3AED]" : "hover:text-[#7C3AED]"}`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-[#7C3AED]" : ""}`} />
            {post.reactions + (liked ? 1 : 0)}
          </button>
          <button
            onClick={() => setShowComments((p) => !p)}
            className={`flex items-center gap-1.5 transition ${showComments ? "text-[#7C3AED]" : "hover:text-[#7C3AED]"}`}
          >
            <MessageCircle className="h-4 w-4" />
            {post.comments + comments.length}
          </button>
          <button
            onClick={handleSaveToggle}
            className={`flex items-center gap-1.5 transition ${saved ? "text-[#7C3AED]" : "hover:text-[#7C3AED]"}`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-[#7C3AED]" : ""}`} />
            {post.saves + (saved ? 1 : 0)}
          </button>
          <div ref={shareRef} className="relative">
            <button
              onClick={() => setShareOpen((p) => !p)}
              className={`flex items-center gap-1.5 transition ${shareOpen ? "text-[#7C3AED]" : "hover:text-[#7C3AED]"}`}
            >
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
            {shareOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-[#E5E0EB] bg-white shadow-xl dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-light text-[#0f0f14] transition hover:bg-[#F5F3FF] dark:text-[#e8e6ff] dark:hover:bg-[#1e1e2e]"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
                  {linkCopied ? "✓ Link copiado!" : "Copiar link da publicação"}
                </button>
                <button
                  onClick={handleRepost}
                  className="flex w-full items-center gap-2.5 border-t border-[#F5F3FF] px-4 py-3 text-left text-[13px] font-light text-[#0f0f14] transition hover:bg-[#F5F3FF] dark:border-[#1e1e2e] dark:text-[#e8e6ff] dark:hover:bg-[#1e1e2e]"
                >
                  <Repeat2 className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" /> Repostar no feed
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setFlagged((p) => !p)}
            aria-label="Marcar publicação"
            className={`ml-auto flex items-center gap-1.5 transition ${flagged ? "text-amber-500" : "hover:text-amber-500"}`}
          >
            <Flag className={`h-4 w-4 ${flagged ? "fill-amber-400" : ""}`} />
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]">
            {comments.length === 0 && (
              <p className="text-[13px] font-light text-[#9CA3AF]">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar src={c.avatar} name={c.author} size="sm" />
                <div className="min-w-0 flex-1 rounded-xl bg-[#F9F8FF] px-3 py-2 dark:bg-[#1e1e2e]">
                  <p className="text-[12px] font-medium text-[#0f0f14] dark:text-[#e8e6ff]">
                    {c.author}
                  </p>
                  <p className="mt-0.5 text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                    {c.text}
                  </p>
                </div>
                {c.author === (user?.name ?? "Você") && (
                  <button
                    onClick={() => setPendingDelete(c.id)}
                    className="mt-1 shrink-0 rounded-lg p-1 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <form onSubmit={submitReply} className="flex items-center gap-2.5">
              <Avatar src={user?.avatar ?? null} name={user?.name ?? "Você"} size="sm" />
              <div className="flex flex-1 items-center gap-2 rounded-full border border-[#E5E0EB] bg-[#F9F8FF] pl-4 pr-1.5 py-1.5 dark:border-[#2a2a3d] dark:bg-[#1e1e2e]">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="flex-1 bg-transparent text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none dark:text-[#e8e6ff]"
                />
                <button
                  aria-label="Enviar comentário"
                  type="submit"
                  disabled={!reply.trim()}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9] disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </article>
    </>
  );
}

/* ── InicioPage ──────────────────────────────────────────────────────────── */
export function InicioPage() {
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<PostType | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(() =>
    localStorage.getItem("cover_image"),
  );
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => feedApi.list(null, 20),
  });

  const { data: suggestionsData } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => networkApi.suggestions(4),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
  });

  const { data: networkSummary } = useQuery({
    queryKey: ["network-summary"],
    queryFn: () => networkApi.summary(),
  });

  const createPostMut = useMutation({
    mutationFn: (data: { content: string; type: PostView["type"] }) => feedApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const deletePostMut = useMutation({
    mutationFn: (postId: string) => feedApi.delete(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const connectMut = useMutation({
    mutationFn: (userId: string) => networkApi.connect(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suggestions"] }),
  });

  const apiPosts = (feedData?.items ?? []).map(postViewToLocal);
  const suggestions = suggestionsData ?? [];
  const events = eventsData?.items ?? [];

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target!.result as string;
      setCoverUrl(url);
      localStorage.setItem("cover_image", url);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = (draft: string, type: PostType, _videoFile: File | null) => {
    createPostMut.mutate({ content: draft, type: type as PostView["type"] });
    addNotif("Sua publicação foi compartilhada com a rede.", "post");
  };

  const handleDelete = (id: string) => deletePostMut.mutate(id);

  const visiblePosts = typeFilter ? apiPosts.filter((p) => p.type === typeFilter) : apiPosts;

  return (
    <AppShell>
      {composerOpen && (
        <PostComposerModal
          user={user}
          onClose={() => setComposerOpen(false)}
          onPublish={handlePublish}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* Trigger — clique abre o Modal de compositor */}
          <button
            type="button"
            aria-label="Criar publicação"
            onClick={() => setComposerOpen(true)}
            className="flex w-full cursor-text items-center gap-3 rounded-2xl border border-[#E5E0EB] bg-white p-4 text-left transition hover:border-[#C4B5FD] dark:border-[#2a2a3d] dark:bg-[#13131f]"
          >
            <Avatar src={user?.avatar ?? null} name={user?.name ?? "Você"} />
            <span className="flex flex-1 items-center justify-between gap-3">
              <span className="text-[14px] font-light text-[#9CA3AF]">
                O que você quer compartilhar?
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 rounded-full bg-[#7C3AED] px-4 py-1.5 text-[13px] font-light text-white"
              >
                Publicar
              </span>
            </span>
          </button>

          {/* Filtros de tópico */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_CHIPS.map(({ key, label }) => (
              <button
                key={label}
                aria-label={key ? `Filtrar por ${label}` : "Mostrar todos os tópicos"}
                onClick={() => setTypeFilter(key as PostType | null)}
                className={`rounded-full px-3 py-1 text-[12px] font-light transition ${
                  typeFilter === key
                    ? "bg-[#7C3AED] text-white"
                    : "border border-[#E5E0EB] bg-white text-[#9CA3AF] hover:border-[#C4B5FD] hover:text-[#6B7280] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#6B7280]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {feedLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-14 text-center dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <p className="text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                  {typeFilter
                    ? `Nenhuma publicação do tipo "${TYPE_LABEL[typeFilter]}"`
                    : "Sem publicações ainda"}
                </p>
              </div>
            ) : (
              visiblePosts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  isOwn={p.authorUsername === user?.username}
                  onDelete={() => handleDelete(p.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Rail direita */}
        <aside className="hidden space-y-4 lg:block">
          <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div
              className="group relative h-14 w-full cursor-pointer"
              style={
                coverUrl
                  ? {
                      backgroundImage: `url(${coverUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : { background: "linear-gradient(135deg, #3B1E7A 0%, #7C3AED 55%, #A78BFA 100%)" }
              }
              onClick={() => coverInputRef.current?.click()}
            >
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 text-[11px] text-transparent transition-all group-hover:bg-black/30 group-hover:text-white">
                <Camera className="h-3.5 w-3.5" /> Alterar capa
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
            <div className="-mt-7 px-4 pb-4 text-center">
              <div className="relative z-10 inline-block">
                <Avatar src={user?.avatar ?? null} name={user?.name ?? "Você"} size="lg" />
              </div>
              <p className="mt-2 text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                {user?.name}
              </p>
              <p className="text-[12px] text-[#9CA3AF]">{user?.headline ?? "Conexão"}</p>
              <div className="mt-3 grid grid-cols-2 gap-1 border-t border-[#F5F3FF] pt-3 text-center text-[12px] dark:border-[#1e1e2e]">
                <div>
                  <p className="font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                    {networkSummary?.connections ?? 0}
                  </p>
                  <p className="text-[#9CA3AF]">Conexões</p>
                </div>
                <div>
                  <p className="font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                    {networkSummary?.followers ?? 0}
                  </p>
                  <p className="text-[#9CA3AF]">Seguidores</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#7C3AED]" />
                <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                  Sugestões para você
                </p>
              </div>
              <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
                Com base em interesses e objetivos em comum.
              </p>
            </div>
            <ul className="space-y-4">
              {suggestions.map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                      {u.name}
                    </p>
                    <p className="truncate text-[11px] text-[#9CA3AF]">{u.headline}</p>
                  </div>
                  <button
                    onClick={() => {
                      connectMut.mutate(u.id);
                      addNotif(`Você se conectou com ${u.name}.`, "connect");
                    }}
                    disabled={connectMut.isPending}
                    className="shrink-0 rounded-full border border-[#E5E0EB] px-3 py-1 text-[12px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-50 dark:border-[#2a2a3d] dark:text-[#9CA3AF]"
                  >
                    Conectar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#7C3AED]" />
              <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                Acontecendo agora
              </p>
            </div>
            <ul className="space-y-4">
              {events.slice(0, 3).map((e) => (
                <li key={e.id}>
                  <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                    {e.title}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {e.date} ·{" "}
                    {e.format === "ONLINE"
                      ? "Online"
                      : e.format === "IN_PERSON"
                        ? "Presencial"
                        : "Híbrido"}{" "}
                    · {e.attendees} confirmados
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

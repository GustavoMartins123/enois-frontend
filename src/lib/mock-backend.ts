// In-memory mock backend. Replaces real HTTP calls so the app runs end-to-end
// without a server. Replace with real fetch when the backend is ready.
import {
  currentUser,
  users,
  communities as seedCommunities,
  posts as seedPosts,
  comments as seedComments,
  jobs as seedJobs,
  events as seedEvents,
  mentors as seedMentors,
  conversations as seedConversations,
  type User,
  type Community as MockCommunity,
} from "./mock-data";

// ---------- helpers ----------

const nowIso = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const FORMAT_MAP: Record<string, "ONLINE" | "IN_PERSON" | "HYBRID"> = {
  Online: "ONLINE",
  Presencial: "IN_PERSON",
  Híbrido: "HYBRID",
};

// ---------- state ----------

interface StoredPost {
  id: string;
  authorId: string;
  type: "INSIGHT" | "ARTICLE" | "QUESTION" | "PROJECT" | "OPPORTUNITY";
  content: string;
  tags: string[];
  mediaIds: string[];
  createdAt: string;
  visibility: "PUBLIC" | "CONNECTIONS" | "MENTORS";
  counters: { reactions: number; comments: number; saves: number; shares: number };
  status: "ACTIVE" | "DELETED";
  communityId: string | null;
}

interface StoredComment {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  status: "ACTIVE" | "DELETED";
}

interface StoredCommunity extends MockCommunity {
  members: number;
  memberIds: string[];
  adminId: string;
}

const TYPE_MAP: Record<string, StoredPost["type"]> = {
  insight: "INSIGHT",
  question: "QUESTION",
  project: "PROJECT",
  opportunity: "OPPORTUNITY",
  article: "ARTICLE",
};

const meId = currentUser.id;
const userPool: User[] = [currentUser, ...users];

const communities: StoredCommunity[] = seedCommunities.map((c) => {
  const adminId = userPool[Math.floor(Math.random() * userPool.length)].id;
  const memberIds = new Set<string>([adminId]);
  // seed some members
  userPool.slice(0, 4).forEach((u) => memberIds.add(u.id));
  if (c.joined) memberIds.add(meId);
  return {
    ...c,
    adminId,
    memberIds: Array.from(memberIds),
    members: Math.max(c.members, memberIds.size),
  };
});

const posts: StoredPost[] = seedPosts.map((p, i) => ({
  id: p.id,
  authorId: p.authorId,
  type: TYPE_MAP[p.type] ?? "INSIGHT",
  content: p.content,
  tags: p.tags,
  mediaIds: [],
  createdAt: new Date(Date.now() - (i + 1) * 3600_000).toISOString(),
  visibility: "PUBLIC",
  counters: {
    reactions: p.reactions,
    comments: p.comments,
    saves: p.saves,
    shares: 0,
  },
  status: "ACTIVE",
  communityId: null,
}));

// Seed a couple of posts per community so the feed isn't empty
communities.forEach((c, idx) => {
  const author = userPool[(idx + 1) % userPool.length];
  posts.unshift({
    id: uid("post"),
    authorId: author.id,
    type: "INSIGHT",
    content: `Bem-vindo à comunidade "${c.name}"! Compartilhe aqui aprendizados, dúvidas e oportunidades.`,
    tags: [c.topic],
    mediaIds: [],
    createdAt: new Date(Date.now() - (idx + 1) * 7200_000).toISOString(),
    visibility: "PUBLIC",
    counters: { reactions: 12 + idx, comments: 3, saves: 4, shares: 1 },
    status: "ACTIVE",
    communityId: c.id,
  });
});

const comments: StoredComment[] = seedComments.flatMap((c) => {
  const main: StoredComment = {
    id: c.id,
    postId: c.postId,
    authorId: c.authorId,
    parentCommentId: null,
    content: c.content,
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
    status: "ACTIVE",
  };
  const replies = (c.replies ?? []).map<StoredComment>((r) => ({
    id: r.id,
    postId: r.postId,
    authorId: r.authorId,
    parentCommentId: c.id,
    content: r.content,
    createdAt: new Date(Date.now() - 900_000).toISOString(),
    status: "ACTIVE",
  }));
  return [main, ...replies];
});

const reactedPosts = new Set<string>();
const savedPosts = new Set<string>();

// ---------- mapping helpers ----------

function userToProfile(u: User) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    headline: u.headline,
    email: `${u.username}@conexao.app`,
    company: u.company,
    location: u.location,
    avatar: u.avatar,
    banner: u.banner,
    bio: u.bio,
    skills: u.skills,
    goals: u.goals,
    availability: u.availability,
    portfolio: u.portfolio,
    externalLinks: u.externalLinks.map((l) => l.url),
    openToWork: u.openToWork,
    isMentor: u.isMentor,
    connectionsCount: u.connections,
    followersCount: u.followers,
    reputation: u.reputation.reduce((acc, r) => acc + r.level, 0),
  };
}

function userToMember(u: User, role: "ADMIN" | "MEMBER") {
  return {
    userId: u.id,
    username: u.username,
    name: u.name,
    avatar: u.avatar,
    role,
  };
}

function communityForResponse(c: StoredCommunity) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    topic: c.topic,
    members: c.members,
    cover: c.cover,
    joined: c.memberIds.includes(meId),
  };
}

// ---------- types ----------

export interface MockError {
  status: number;
  code: string;
  message: string;
}

class MockApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// ---------- dispatch ----------

function parseQuery(path: string): { pathname: string; query: URLSearchParams } {
  const [pathname, search = ""] = path.split("?");
  return { pathname, query: new URLSearchParams(search) };
}

function notFound(): never {
  throw new MockApiError(404, "NOT_FOUND", "Endpoint não encontrado no mock");
}

export async function mockDispatch(
  method: string,
  rawPath: string,
  body: unknown,
): Promise<unknown> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 120));

  const { pathname, query } = parseQuery(rawPath);
  const segments = pathname.split("/").filter(Boolean);
  const data = (body ?? {}) as Record<string, unknown>;

  // ---------- AUTH ----------
  if (segments[0] === "auth") {
    if (method === "POST" && segments[1] === "login") {
      return {
        token: uid("token"),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
        user: {
          id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          headline: currentUser.headline,
          email: (data.email as string) ?? "voce@exemplo.com",
        },
      };
    }
    if (method === "POST" && segments[1] === "signup") {
      return {
        token: uid("token"),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
        user: {
          id: currentUser.id,
          username: currentUser.username,
          name: (data.name as string) ?? currentUser.name,
          headline: (data.role as string) ?? currentUser.headline,
          email: (data.email as string) ?? "voce@exemplo.com",
        },
      };
    }
    if (method === "POST" && segments[1] === "logout") return undefined;
    if (method === "GET" && segments[1] === "me") return userToProfile(currentUser);
    if (segments[1] === "password") return { status: "OK" };
  }

  // ---------- PROFILE ----------
  if (method === "GET" && pathname === "/me") return userToProfile(currentUser);
  if (method === "PATCH" && pathname === "/me/profile") return userToProfile(currentUser);
  if (method === "GET" && segments[0] === "me") {
    // experiences / education / certifications
    return [];
  }

  if (segments[0] === "users") {
    // /users/by-id/:id
    if (segments[1] === "by-id" && segments[2]) {
      const u = userPool.find((x) => x.id === segments[2]) ?? userPool[0];
      return userToProfile(u);
    }
    // /users/:username
    if (method === "GET" && segments[1] && !segments[2]) {
      const u = userPool.find((x) => x.username === segments[1]);
      if (!u) throw new MockApiError(404, "USER_NOT_FOUND", "Usuário não encontrado");
      return userToProfile(u);
    }
    // /users/:username/posts
    if (method === "GET" && segments[2] === "posts") {
      const u = userPool.find((x) => x.username === segments[1]);
      const items = posts.filter((p) => p.authorId === u?.id);
      return { items, nextCursor: null };
    }
  }

  // ---------- COMMUNITIES ----------
  if (segments[0] === "communities") {
    // /communities
    if (segments.length === 1) {
      if (method === "GET") {
        const topic = query.get("topic");
        const items = communities
          .filter((c) => !topic || c.topic.toUpperCase() === topic.toUpperCase())
          .map(communityForResponse);
        return { items, nextCursor: null };
      }
      if (method === "POST") {
        const c: StoredCommunity = {
          id: uid("community"),
          name: (data.name as string) ?? "Nova comunidade",
          description: (data.description as string) ?? "",
          topic: (data.topic as string) ?? "TECNOLOGIA",
          cover: (data.cover as string) ?? "",
          members: 1,
          adminId: meId,
          memberIds: [meId],
        };
        communities.unshift(c);
        return communityForResponse(c);
      }
    }

    const community = communities.find((c) => c.id === segments[1]);
    if (!community) throw new MockApiError(404, "COMMUNITY_NOT_FOUND", "Comunidade não encontrada");

    if (segments.length === 2) {
      if (method === "GET") return communityForResponse(community);
      if (method === "PATCH") {
        if (data.name) community.name = data.name as string;
        if (data.description) community.description = data.description as string;
        if (data.topic) community.topic = data.topic as string;
        if (data.cover !== undefined) community.cover = data.cover as string;
        return communityForResponse(community);
      }
    }

    if (segments[2] === "members") {
      if (method === "POST") {
        if (!community.memberIds.includes(meId)) {
          community.memberIds.push(meId);
          community.members += 1;
        }
        return { id: community.id, status: "JOINED" };
      }
      if (method === "DELETE") {
        const i = community.memberIds.indexOf(meId);
        if (i >= 0) {
          community.memberIds.splice(i, 1);
          community.members = Math.max(0, community.members - 1);
        }
        return { id: community.id, status: "LEFT" };
      }
      if (method === "GET") {
        const items = community.memberIds
          .map((id) => userPool.find((u) => u.id === id))
          .filter((u): u is User => !!u)
          .map((u) => userToMember(u, u.id === community.adminId ? "ADMIN" : "MEMBER"));
        return { items };
      }
    }

    if (segments[2] === "feed" && method === "GET") {
      const items = posts.filter((p) => p.communityId === community.id && p.status === "ACTIVE");
      return { items, nextCursor: null };
    }
  }

  // ---------- FEED ----------
  if (segments[0] === "feed") {
    if (segments.length === 1 && method === "GET") {
      const items = posts.filter((p) => p.communityId === null && p.status === "ACTIVE");
      return { items, nextCursor: null };
    }
    if (segments[1] === "posts") {
      // POST /feed/posts
      if (segments.length === 2 && method === "POST") {
        const p: StoredPost = {
          id: uid("post"),
          authorId: meId,
          type: (data.type as StoredPost["type"]) ?? "INSIGHT",
          content: (data.content as string) ?? "",
          tags: (data.tags as string[]) ?? [],
          mediaIds: (data.mediaIds as string[]) ?? [],
          createdAt: nowIso(),
          visibility: "PUBLIC",
          counters: { reactions: 0, comments: 0, saves: 0, shares: 0 },
          status: "ACTIVE",
          communityId: (data.communityId as string) ?? null,
        };
        posts.unshift(p);
        return p;
      }
      const postId = segments[2];
      const post = posts.find((p) => p.id === postId);
      if (!post) throw new MockApiError(404, "POST_NOT_FOUND", "Post não encontrado");

      if (segments.length === 3 && method === "DELETE") {
        post.status = "DELETED";
        return { postId, status: "DELETED" };
      }

      if (segments[3] === "reactions") {
        if (method === "POST") {
          if (!reactedPosts.has(postId)) {
            reactedPosts.add(postId);
            post.counters.reactions += 1;
          }
          return { postId, status: "REACTED", counters: post.counters };
        }
        if (method === "DELETE") {
          if (reactedPosts.delete(postId)) {
            post.counters.reactions = Math.max(0, post.counters.reactions - 1);
          }
          return { postId, status: "REMOVED", counters: post.counters };
        }
      }

      if (segments[3] === "saves") {
        if (method === "POST") {
          if (!savedPosts.has(postId)) {
            savedPosts.add(postId);
            post.counters.saves += 1;
          }
          return { postId, status: "SAVED", counters: post.counters };
        }
        if (method === "DELETE") {
          if (savedPosts.delete(postId)) {
            post.counters.saves = Math.max(0, post.counters.saves - 1);
          }
          return { postId, status: "REMOVED", counters: post.counters };
        }
      }

      if (segments[3] === "shares" && method === "POST") {
        post.counters.shares += 1;
        return { postId, status: "SHARED", counters: post.counters };
      }

      if (segments[3] === "comments") {
        if (method === "GET") {
          const items = comments.filter((c) => c.postId === postId);
          return { items, nextCursor: null };
        }
        if (method === "POST") {
          const c: StoredComment = {
            id: uid("comment"),
            postId,
            authorId: meId,
            parentCommentId: (data.parentCommentId as string | null) ?? null,
            content: (data.content as string) ?? "",
            createdAt: nowIso(),
            status: "ACTIVE",
          };
          comments.push(c);
          post.counters.comments += 1;
          return c;
        }
      }
    }
  }

  // ---------- JOBS ----------
  if (segments[0] === "jobs") {
    if (segments.length === 1 && method === "GET") {
      return { items: seedJobs, nextCursor: null };
    }
    if (segments.length === 2 && method === "GET") {
      const job = seedJobs.find((j) => j.id === segments[1]);
      if (!job) throw new MockApiError(404, "JOB_NOT_FOUND", "Vaga não encontrada");
      return job;
    }
    if (segments[2] === "applications" && method === "POST") return { status: "APPLIED" };
    if (segments[2] === "saves") return { status: method === "POST" ? "SAVED" : "REMOVED" };
  }

  // ---------- EVENTS ----------
  if (segments[0] === "events") {
    if (segments.length === 1 && method === "GET") {
      const items = seedEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        format: FORMAT_MAP[e.format] ?? "ONLINE",
        host: e.host,
        attendees: e.attendees,
        cover: e.cover,
      }));
      return { items, nextCursor: null };
    }
    if (segments[2] === "attendees") {
      return { status: method === "POST" ? "ATTENDING" : "CANCELLED" };
    }
  }

  // ---------- MENTORS ----------
  if (segments[0] === "mentors") {
    if (segments.length === 1 && method === "GET") {
      return { items: seedMentors, nextCursor: null };
    }
    if (segments[2] === "slots" && method === "GET") return [];
    if (segments[2] === "sessions" && method === "POST")
      return { status: "REQUESTED", sessionId: uid("session") };
  }

  // ---------- MESSAGES ----------
  if (segments[0] === "conversations") {
    if (segments.length === 1 && method === "GET") {
      const items = seedConversations.map((c) => ({
        id: c.id,
        kind: c.kind.toUpperCase(),
        title: c.title ?? null,
        participantIds: c.participantIds ?? [c.userId],
        lastMessage: c.lastMessage,
        time: c.time,
        unread: c.unread,
      }));
      return { items, nextCursor: null };
    }
    if (segments[2] === "messages") {
      if (method === "GET") return { items: [], nextCursor: null };
      if (method === "POST")
        return {
          id: uid("msg"),
          from: meId,
          text: (data.text as string) ?? "",
          time: nowIso(),
        };
    }
    if (segments[2] === "read") return undefined;
  }

  // ---------- NETWORK ----------
  if (segments[0] === "network") {
    if (segments[1] === "summary")
      return { userId: meId, connections: currentUser.connections, followers: currentUser.followers, pendingRequests: 0 };
    if (segments[1] === "suggestions")
      return users.slice(0, 4).map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        headline: u.headline,
        avatar: u.avatar,
        connections: u.connections,
        followers: u.followers,
        connected: false,
      }));
    if (segments[1] === "users") {
      return {
        items: users.map((u) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          headline: u.headline,
          avatar: u.avatar,
          connections: u.connections,
          followers: u.followers,
          connected: false,
        })),
        nextCursor: null,
      };
    }
    if (segments[1] === "requests") return { items: [], nextCursor: null };
    if (segments[1] === "connections") return { id: segments[2] ?? "", status: "REQUESTED" };
  }

  // ---------- NOTIFICATIONS ----------
  if (segments[0] === "notifications") {
    if (method === "GET") return { items: [], nextCursor: null };
    return undefined;
  }

  // ---------- SEARCH ----------
  if (segments[0] === "search" && method === "GET") {
    return { items: [], nextCursor: null };
  }

  // ---------- MEDIA ----------
  if (segments[0] === "media") {
    if (method === "POST" && segments[1] === "uploads") {
      const id = uid("media");
      return { id, uploadUrl: "", cdnUrl: "", status: "PENDING" };
    }
    if (method === "GET" && segments[1]) {
      return {
        id: segments[1],
        fileName: "",
        mimeType: "image/jpeg",
        size: 0,
        purpose: "post",
        status: "UPLOADED",
        uploadUrl: null,
        cdnUrl: null,
        createdAt: nowIso(),
      };
    }
    if (method === "DELETE") return { id: segments[1] ?? "", status: "DELETED" };
  }

  // Unknown route — return empty success instead of failing, to keep UI usable
  console.warn(`[mock-backend] unmatched ${method} ${rawPath}`);
  return null;
}

export { MockApiError };

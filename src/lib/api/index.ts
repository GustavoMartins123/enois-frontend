export { authApi } from "./auth";
export type { SignupInput, LoginInput, AuthUser, AuthResponse } from "./auth";

export { profileApi } from "./profile";
export type { Profile, UpdateProfileRequest, Experience, Education, Certification } from "./profile";

export { feedApi } from "./feed";
export type { PostView, CreatePostInput, PageResponse } from "./feed";

export { commentsApi } from "./comments";
export type { CommentView } from "./comments";

export { reactionsApi } from "./reactions";
export type { ActionResponse } from "./reactions";

export { networkApi } from "./network";
export type { NetworkUser, NetworkSummary, ConnectionRequest, ConnectionStatus } from "./network";

export { mediaApi } from "./media";
export type { MediaUploadResponse, MediaAsset } from "./media";

export { communitiesApi } from "./communities";
export type { Community, CreateCommunityInput, CommunityMember } from "./communities";

export { jobsApi } from "./jobs";
export type { Job } from "./jobs";

export { eventsApi } from "./events";
export type { Event } from "./events";

export { mentorsApi } from "./mentors";
export type { Mentor, TimeSlot } from "./mentors";

export { messagesApi } from "./messages";
export type { Conversation, Message, CreateConversationInput } from "./messages";

export { notificationsApi } from "./notifications";
export type { Notification } from "./notifications";

export { searchApi } from "./search";
export type { SearchResult, SearchResponse } from "./search";

export { api, ApiError, buildQuery, getSessionToken } from "../api-client";

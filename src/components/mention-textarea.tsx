import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi, type UserSearchResult } from "@/lib/api";
import { UserAvatar } from "@/components/user-avatar";

interface Props {
  value: string;
  onChange: (value: string, mentionedUserIds: string[]) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  className = "",
  maxLength,
  rows,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const { data: mentionResults = [] } = useQuery({
    queryKey: ["users", "search", mentionSearch],
    queryFn: () => usersApi.search(mentionSearch),
    enabled: mentionSearch.length >= 2,
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionResults.length]);

  const detectMention = (text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1 || atIdx < 0) {
      setMentionSearch("");
      setMentionStart(-1);
      return;
    }
    const afterAt = before.slice(atIdx + 1);
    if (afterAt.includes(" ") || afterAt.includes("\n")) {
      setMentionSearch("");
      setMentionStart(-1);
      return;
    }
    if (afterAt.length === 0) {
      setMentionSearch("");
      setMentionStart(-1);
      return;
    }
    setMentionSearch(afterAt);
    setMentionStart(atIdx);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    const cursor = e.target.selectionStart ?? next.length;
    detectMention(next, cursor);
    onChange(next, mentionedUserIds);
  };

  const selectMention = (user: UserSearchResult) => {
    if (mentionStart === -1) return;
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + mentionSearch.length + 1);
    const next = `${before}@${user.username} ${after}`;
    setMentionSearch("");
    setMentionStart(-1);
    setMentionedUserIds((prev) => (prev.includes(user.id) ? prev : [...prev, user.id]));
    onChange(next, [...mentionedUserIds, user.id]);
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + user.username.length + 2;
        textareaRef.current.setSelectionRange(pos, pos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionSearch.length >= 2 && mentionResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % mentionResults.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + mentionResults.length) % mentionResults.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectMention(mentionResults[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionSearch("");
        setMentionStart(-1);
        return;
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
        rows={rows}
      />
      {mentionSearch.length >= 2 && mentionResults.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {mentionResults.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectMention(user);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                i === selectedIndex ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              <UserAvatar src={user.avatar} alt={user.name} className="h-8 w-8" />
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

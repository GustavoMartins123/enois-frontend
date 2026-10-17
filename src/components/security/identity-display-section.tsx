import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";

import { preferencesApi } from "@/lib/api";
import { useCurrentUser } from "@/lib/current-user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

/**
 * Nome e identidade: nome social (substitui o de cadastro para todo mundo), apelido
 * (entra entre parênteses depois do nome) e pronomes (só no perfil). O nome de
 * cadastro continua existindo para o dono da conta e para a empresa que recebe a
 * candidatura — que vê os dois nomes, um abaixo do outro.
 */
export function IdentitySection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: me } = useCurrentUser();

  const [socialName, setSocialName] = useState("");
  const [nickname, setNickname] = useState("");
  const [pronouns, setPronouns] = useState("");

  useEffect(() => {
    if (!me) return;
    setSocialName(me.socialName ?? "");
    setNickname(me.nickname ?? "");
    setPronouns(me.pronouns ?? "");
  }, [me]);

  const save = useMutation({
    mutationFn: () =>
      preferencesApi.setIdentity({
        socialName: socialName.trim() || null,
        nickname: nickname.trim() || null,
        pronouns: pronouns.trim() || null,
      }),
    onSuccess: () => {
      toast(texts.account.identity.saved);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast(texts.account.identity.error, "error"),
  });

  return (
    <section className="surface-card space-y-3 p-4">
      <div>
        <h2 className="text-base font-medium">{texts.account.identity.title}</h2>

        <p className="mt-0.5 text-sm text-muted-foreground">{texts.account.identity.hint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {texts.account.identity.socialName}
          </Label>

          <Input
            value={socialName}
            onChange={(event) => setSocialName(event.target.value)}
            maxLength={160}
            placeholder={texts.account.identity.placeholderOptional}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{texts.account.identity.nickname}</Label>

          <Input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={60}
            placeholder={texts.account.identity.placeholderOptional}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{texts.account.identity.pronouns}</Label>

          <Input
            value={pronouns}
            onChange={(event) => setPronouns(event.target.value)}
            maxLength={60}
            placeholder="ela/dela"
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="rounded-full"
        disabled={save.isPending}
        onClick={() => save.mutate()}
      >
        {texts.account.identity.save}
      </Button>
    </section>
  );
}

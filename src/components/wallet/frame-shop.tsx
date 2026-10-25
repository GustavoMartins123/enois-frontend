import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FRAME_SHOP_PAGE_SIZE } from "@/constants/frame-shop";
import { texts } from "@/texts";
import type { CatalogOrder } from "@/types/application/loja/catalog-order";
import type { LojaItem } from "@/types/application/loja/loja-item";
import type { FrameShopProps } from "@/types/components/wallet/frame-shop-props";
import { ArrowUpRight, Check, ChevronDown, Heart, Search, Sparkles } from "lucide-react";

import { lojaApi } from "@/lib/api";
import { ANIMATED_FRAMES } from "@/lib/avatar-frames";
import { useCurrentUser } from "@/lib/current-user";
import { formatFaisca } from "@/lib/faisca";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";

import { UserAvatar } from "@/components/user-avatar";

import "./frame-shop.css";

export function FrameShop({ onlyOwned = false }: FrameShopProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const [filter, setFilter] = useState("all");
  const [order, setOrder] = useState<CatalogOrder>("oldest");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(FRAME_SHOP_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const catalog = useQuery({ queryKey: ["loja", order], queryFn: () => lojaApi.catalog(order) });
  const buy = useMutation({
    mutationFn: (id: string) => lojaApi.buy(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loja"] });
      void queryClient.invalidateQueries({ queryKey: ["carteira"] });
      toast(texts.frameShop.bought, "success");
    },
    onError: () => toast(texts.frameShop.buyError, "error"),
  });
  const equip = useMutation({
    mutationFn: (id: string) => lojaApi.equip(id),
    onSuccess: () => {
      for (const key of ["loja", "profile", "me", "feed"]) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    onError: () => toast(texts.frameShop.equipError, "error"),
  });

  if (catalog.isPending) return <LoadingState />;
  if (catalog.isError || !catalog.data) {
    return (
      <div className="frame-shop-error" role="alert">
        <p>{texts.frameShop.loadError}</p>

        <Button variant="outline" onClick={() => catalog.refetch()}>
          {texts.frameShop.retry}
        </Button>
      </div>
    );
  }

  const items = catalog.data;
  const selected = items.find((item) => item.id === selectedId);
  const featured = items.slice(0, 3);
  const visibleItems = items.filter((item) => {
    if (onlyOwned && !item.owned) return false;
    if (
      !`${item.name} ${item.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR"))
    )
      return false;
    if (filter === "animated") return ANIMATED_FRAMES.includes(item.id);
    if (filter === "simple") return !ANIMATED_FRAMES.includes(item.id);
    return true;
  });

  const action = (item: LojaItem) => (
    <Button
      size="sm"
      variant={item.owned ? "outline" : "default"}
      className={item.equipped ? "frame-shop-action is-equipped" : "frame-shop-action"}
      disabled={buy.isPending || equip.isPending}
      onClick={() =>
        item.owned ? equip.mutate(item.equipped ? "none" : item.id) : buy.mutate(item.id)
      }
    >
      {item.equipped
        ? texts.frameShop.unequip
        : item.owned
          ? texts.frameShop.equip
          : texts.frameShop.buy}
      {!item.owned && <ArrowUpRight className="h-3.5 w-3.5" />}
    </Button>
  );

  const changeFilter = (value: string) => {
    setFilter(value);
    setVisible(FRAME_SHOP_PAGE_SIZE);
  };

  return (
    <div className="frame-shop">
      <section className="frame-shop-hero">
        <div className="frame-shop-hero-copy">
          <span className="frame-shop-eyebrow">
            <Sparkles size={12} />
            {onlyOwned ? texts.frameShop.yourCollection : texts.frameShop.cosmetics}
          </span>

          <h2>{onlyOwned ? texts.frameShop.ownedTitle : texts.frameShop.heroTitle}</h2>

          <p>{onlyOwned ? texts.frameShop.ownedDescription : texts.frameShop.heroDescription}</p>
        </div>

        <div className="frame-shop-hero-art">
          <span className="frame-shop-orbit" />
          <span className="frame-shop-orbit outer" />
          <UserAvatar
            src={user?.avatar}
            alt={user?.name}
            frame={user?.avatarFrame}
            className="frame-shop-hero-avatar"
          />

          {!onlyOwned &&
            featured.map((item, index) => (
              <span className={`frame-shop-float position-${index}`} key={item.id}>
                <UserAvatar
                  src={user?.avatar}
                  alt={user?.name}
                  frame={item.id}
                  className="frame-shop-float-avatar"
                />
              </span>
            ))}
        </div>
      </section>

      <section aria-label={texts.frameShop.catalog}>
        <div className="frame-shop-toolbar">
          <div>
            <h2>
              {onlyOwned ? texts.frameShop.ownedTab : texts.frameShop.catalog}
              <span>{visibleItems.length}</span>
            </h2>

            <p>{texts.frameShop.catalogDescription}</p>
          </div>

          <label className="frame-shop-search">
            <Search size={16} />
            <input
              aria-label={texts.frameShop.search}
              placeholder={texts.frameShop.search}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisible(FRAME_SHOP_PAGE_SIZE);
              }}
            />
          </label>
        </div>

        <div className="frame-shop-controls">
          <div className="frame-shop-filters" aria-label={texts.frameShop.filterLabel}>
            {Object.entries(texts.frameShop.filters).map(([key, label]) => (
              <button key={key} aria-pressed={filter === key} onClick={() => changeFilter(key)}>
                {label}
              </button>
            ))}
          </div>

          <label className="frame-shop-order">
            <span>{texts.frameShop.orderLabel}</span>

            <select
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as CatalogOrder);
                setVisible(FRAME_SHOP_PAGE_SIZE);
              }}
            >
              <option value="oldest">{texts.frameShop.oldestFirst}</option>

              <option value="newest">{texts.frameShop.newestFirst}</option>
            </select>
          </label>
        </div>

        {visibleItems.length === 0 ? (
          <div className="frame-shop-empty">
            <Search size={26} />

            <h3>
              {onlyOwned && items.every((item) => !item.owned)
                ? texts.frameShop.noOwned
                : texts.frameShop.noResults}
            </h3>

            <p>{texts.frameShop.emptyHint}</p>
          </div>
        ) : (
          <ul className="frame-shop-grid">
            {visibleItems.slice(0, visible).map((item) => (
              <li className={`frame-shop-card ${item.equipped ? "is-equipped" : ""}`} key={item.id}>
                <button
                  className="frame-shop-stage"
                  aria-label={texts.frameShop.tryItem(item.name)}
                  onClick={() => setSelectedId(item.id)}
                >
                  <span className="frame-shop-badges">
                    {item.owned && (
                      <span className="frame-shop-owned" title={texts.frameShop.owned}>
                        <Check size={13} />
                      </span>
                    )}
                  </span>

                  <UserAvatar
                    src={user?.avatar}
                    alt={user?.name}
                    frame={item.id}
                    className="frame-shop-card-avatar"
                  />

                  <span className="frame-shop-try">
                    {texts.frameShop.try}
                    <ArrowUpRight size={12} />
                  </span>
                </button>

                <div className="frame-shop-card-body">
                  <div className="frame-shop-card-title">
                    <h3>{item.name}</h3>

                    <span className="frame-shop-price">
                      <Sparkles size={13} />
                      {formatFaisca(item.priceMf)}
                    </span>
                  </div>

                  <p>{item.description}</p>

                  <div className="frame-shop-card-footer">
                    <span>
                      {item.equipped
                        ? texts.frameShop.equipped
                        : ANIMATED_FRAMES.includes(item.id)
                          ? texts.frameShop.animated
                          : texts.frameShop.simple}
                    </span>
                    {action(item)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="frame-shop-pagination">
          <p>
            {texts.frameShop.showing(Math.min(visible, visibleItems.length), visibleItems.length)}
          </p>

          {visible < visibleItems.length && (
            <Button
              variant="outline"
              onClick={() => setVisible((value) => value + FRAME_SHOP_PAGE_SIZE)}
            >
              {texts.frameShop.showMore}
              <ChevronDown size={15} />
            </Button>
          )}
        </div>
      </section>

      <p className="frame-shop-note">
        <Heart size={14} />
        {texts.frameShop.note}
      </p>

      <Dialog
        open={selected !== undefined}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="frame-shop-dialog" aria-describedby={undefined}>
          {selected && (
            <>
              <span className="frame-shop-eyebrow">{texts.frameShop.preview}</span>

              <DialogTitle>{selected.name}</DialogTitle>

              <div className="frame-shop-profile">
                <div className="frame-shop-profile-cover" />
                <UserAvatar
                  src={user?.avatar}
                  alt={user?.name}
                  frame={selected.id}
                  className="frame-shop-preview-avatar"
                />

                <strong>{user?.name}</strong>

                <span>{user?.username}</span>

                <p>{user?.headline}</p>
              </div>

              <p className="frame-shop-preview-description">{selected.description}</p>

              <div className="frame-shop-preview-footer">
                <span className="frame-shop-price">
                  <Sparkles size={17} />
                  {formatFaisca(selected.priceMf)}
                  <small>{texts.frameShop.sparks}</small>
                </span>
                {action(selected)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

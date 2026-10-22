export type InfiniteScrollProps = {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /** Texto mostrado enquanto a proxima pagina carrega. */
  loadingLabel?: string;
  /** Texto mostrado quando nao ha mais paginas (opcional). */
  endLabel?: string;
};

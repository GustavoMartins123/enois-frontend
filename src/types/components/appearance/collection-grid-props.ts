export type CollectionGridProps = {
  /** Identificador da coleção ativa; `null` é o padrão da marca. */
  activeId: string | null;
  /** Chamado ao escolher; a aplicação é imediata — o diálogo é o próprio preview. */
  onSelect: (collectionId: string | null) => void;
};

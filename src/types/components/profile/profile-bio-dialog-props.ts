export type ProfileBioDialogProps = {
  /** HTML atual da bio (nulo quando a pessoa usa a bio de texto). */
  initialHtml: string | null;
  onSaved: () => void;
};

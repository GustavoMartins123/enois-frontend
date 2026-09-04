import type { ReactNode } from "react";

type ShellLayoutProps = {
  header: ReactNode;
  sidebar?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
};

export function ShellLayout({ header, sidebar, navigation, children }: ShellLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {header}

      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:pb-6">
        {sidebar}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {navigation}
    </div>
  );
}

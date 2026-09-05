import type { ReactNode } from "react";

type AppLayoutBlockProps = {
  children: ReactNode;
};

function AppLayoutRoot({ children }: AppLayoutBlockProps) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

function AppLayoutHeader({ children }: AppLayoutBlockProps) {
  return <>{children}</>;
}

function AppLayoutContent({ children }: AppLayoutBlockProps) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:pb-6">
      {children}
    </div>
  );
}

function AppLayoutSidebar({ children }: AppLayoutBlockProps) {
  return <>{children}</>;
}

function AppLayoutMain({ children }: AppLayoutBlockProps) {
  return <main className="min-w-0 flex-1">{children}</main>;
}

function AppLayoutNavigation({ children }: AppLayoutBlockProps) {
  return <>{children}</>;
}

export const AppLayout = Object.assign(AppLayoutRoot, {
  Header: AppLayoutHeader,
  Content: AppLayoutContent,
  Sidebar: AppLayoutSidebar,
  Main: AppLayoutMain,
  Navigation: AppLayoutNavigation,
});

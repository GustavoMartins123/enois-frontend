import type { WithRequiredChildren } from "@/types/components/with-required-children";

function AppLayoutRoot({ children }: WithRequiredChildren) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

function AppLayoutHeader({ children }: WithRequiredChildren) {
  return <>{children}</>;
}

function AppLayoutContent({ children }: WithRequiredChildren) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:pb-6">
      {children}
    </div>
  );
}

function AppLayoutSidebar({ children }: WithRequiredChildren) {
  return <>{children}</>;
}

function AppLayoutMain({ children }: WithRequiredChildren) {
  return <main className="min-w-0 flex-1">{children}</main>;
}

function AppLayoutNavigation({ children }: WithRequiredChildren) {
  return <>{children}</>;
}

export const AppLayout = Object.assign(AppLayoutRoot, {
  Header: AppLayoutHeader,
  Content: AppLayoutContent,
  Sidebar: AppLayoutSidebar,
  Main: AppLayoutMain,
  Navigation: AppLayoutNavigation,
});

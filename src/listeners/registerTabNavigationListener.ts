import type { HtmlRoot } from "../types.js";

export function registerTabNavigationListener(
  html: HtmlRoot,
  {
    getActiveTab,
    setActiveTab
  }: {
    getActiveTab: () => string;
    setActiveTab: (tab: string) => void;
  }
): void {
  const tabs = html.find("[data-tab-target]");
  const panels = html.find("[data-tab-panel]");
  const activeTab = getActiveTab();
  const hasActivePanel = panels.filter(`[data-tab-panel='${activeTab}']`).length > 0;

  if (!hasActivePanel) {
    const firstTab = (tabs.first().data("tabTarget") as string | undefined) ?? "main";

    setActiveTab(firstTab);
  }

  const currentTab = getActiveTab();

  tabs.removeClass("is-active");
  panels.removeClass("is-active");
  tabs.filter(`[data-tab-target='${currentTab}']`).addClass("is-active");
  panels.filter(`[data-tab-panel='${currentTab}']`).addClass("is-active");

  tabs.on("click", (ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();

    const target = (ev.currentTarget as HTMLElement | null)?.dataset?.tabTarget;

    if (!target) return;
    setActiveTab(target);

    tabs.removeClass("is-active");
    $(ev.currentTarget as HTMLElement).addClass("is-active");

    panels.removeClass("is-active");
    html.find(`[data-tab-panel='${target}']`).addClass("is-active");

    return false;
  });
}

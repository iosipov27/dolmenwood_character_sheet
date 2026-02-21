import type { HtmlRoot } from "../types.js";

const TABS_GROUP = "dolmenwood-sheet-tabs";
const TABS_NAV_SELECTOR = ".dolmenwood-sheet__tabs";
const TABS_CONTENT_SELECTOR = ".dolmenwood-sheet__content";

function ensureTabMeta(
  root: HTMLElement,
  navItems: HTMLElement[],
  panels: HTMLElement[]
): { tabNames: string[] } {
  const navRoot = root.querySelector<HTMLElement>(TABS_NAV_SELECTOR);

  if (navRoot) navRoot.dataset.group = navRoot.dataset.group || TABS_GROUP;

  for (const item of navItems) {
    item.dataset.tab = item.dataset.tab || item.dataset.tabTarget || "";
    item.dataset.group = item.dataset.group || TABS_GROUP;
  }

  for (const panel of panels) {
    panel.dataset.tab = panel.dataset.tab || panel.dataset.tabPanel || "";
    panel.dataset.group = panel.dataset.group || TABS_GROUP;
  }

  const tabNames = navItems
    .map((item) => item.dataset.tab ?? "")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return { tabNames };
}

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
  const root = html.get(0);

  if (!(root instanceof HTMLElement)) return;

  const navItems = Array.from(
    root.querySelectorAll<HTMLElement>(`${TABS_NAV_SELECTOR} [data-tab], ${TABS_NAV_SELECTOR} [data-tab-target]`)
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>(
      `${TABS_CONTENT_SELECTOR} [data-tab], ${TABS_CONTENT_SELECTOR} [data-tab-panel]`
    )
  );

  if (!navItems.length || !panels.length) {
    setActiveTab("main");

    return;
  }

  const { tabNames } = ensureTabMeta(root, navItems, panels);
  const requestedTab = getActiveTab();
  const hasRequestedTab = panels.some((panel) => panel.dataset.tab === requestedTab);
  const initialTab = hasRequestedTab ? requestedTab : tabNames[0] ?? "main";

  if (initialTab !== requestedTab) {
    setActiveTab(initialTab);
  }

  const TabsController = globalThis.foundry?.applications?.ux?.Tabs;

  if (typeof TabsController !== "function") return;

  const tabs = new TabsController({
    group: TABS_GROUP,
    navSelector: TABS_NAV_SELECTOR,
    contentSelector: TABS_CONTENT_SELECTOR,
    initial: initialTab,
    callback: (_event: MouseEvent | null, _tabs: unknown, tabName: string) => {
      setActiveTab(tabName);
    }
  });

  tabs.bind(root);
  const activate = (tabs as { activate?: (tabName: string) => void }).activate;

  if (typeof activate === "function") {
    activate.call(tabs, initialTab);
  }

  const currentTab = String(tabs.active ?? "").trim();

  if (currentTab && currentTab !== getActiveTab()) {
    setActiveTab(currentTab);
  }
}

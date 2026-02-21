import { afterEach, describe, expect, it, vi } from "vitest";
import { registerTabNavigationListener } from "./registerTabNavigationListener.js";

describe("registerTabNavigationListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("binds Foundry Tabs with the currently active tab", () => {
    let capturedConfig:
      | {
          group?: string;
          navSelector: string;
          contentSelector?: string;
          initial?: string;
          callback?: ((event: MouseEvent | null, tabs: unknown, tabName: string) => unknown) | null;
        }
      | undefined;
    const bind = vi.fn();

    class TabsMock {
      active: string;

      constructor(config: {
        group?: string;
        navSelector: string;
        contentSelector?: string;
        initial?: string;
        callback?: ((event: MouseEvent | null, tabs: unknown, tabName: string) => unknown) | null;
      }) {
        capturedConfig = config;
        this.active = config.initial ?? "main";
      }

      bind(html: HTMLElement): void {
        bind(html);
      }
    }

    const originalFoundry = globalThis.foundry as Record<string, unknown> | undefined;
    const foundryWithTabs = {
      ...(originalFoundry ?? {}),
      applications: {
        ...((originalFoundry as { applications?: Record<string, unknown> } | undefined)?.applications ??
          {}),
        ux: {
          ...((originalFoundry as { applications?: { ux?: Record<string, unknown> } } | undefined)
            ?.applications?.ux ?? {}),
          Tabs: TabsMock
        }
      }
    };

    vi.stubGlobal("foundry", foundryWithTabs);

    document.body.innerHTML = `
      <div class="dolmenwood-sheet__tabs">
        <button data-tab-target="main">Main</button>
        <button data-tab-target="second">Second</button>
        <button data-tab-target="third">Third</button>
      </div>
      <div class="dolmenwood-sheet__content">
        <div data-tab-panel="main">Main content</div>
        <div data-tab-panel="second">Second content</div>
        <div data-tab-panel="third">Third content</div>
      </div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "second");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    expect(capturedConfig).toEqual(
      expect.objectContaining({
        group: "dolmenwood-sheet-tabs",
        navSelector: ".dolmenwood-sheet__tabs",
        contentSelector: ".dolmenwood-sheet__content",
        initial: "second"
      })
    );
    expect(bind).toHaveBeenCalledTimes(1);
    expect(bind).toHaveBeenCalledWith(document.body);
    expect(html.find("[data-tab-target='second']").attr("data-tab")).toBe("second");
    expect(html.find("[data-tab-panel='second']").attr("data-tab")).toBe("second");
    expect(html.find("[data-tab-target='second']").attr("data-group")).toBe("dolmenwood-sheet-tabs");
    expect(html.find("[data-tab-panel='second']").attr("data-group")).toBe("dolmenwood-sheet-tabs");
    expect(setActiveTab).not.toHaveBeenCalled();
  });

  it("sets fallback tab when active tab does not exist", () => {
    let capturedConfig: { initial?: string } | undefined;

    class TabsMock {
      active: string;

      constructor(config: { initial?: string }) {
        capturedConfig = config;
        this.active = config.initial ?? "main";
      }

      bind(_html: HTMLElement): void {}
    }

    const originalFoundry = globalThis.foundry as Record<string, unknown> | undefined;
    const foundryWithTabs = {
      ...(originalFoundry ?? {}),
      applications: {
        ...((originalFoundry as { applications?: Record<string, unknown> } | undefined)?.applications ??
          {}),
        ux: {
          ...((originalFoundry as { applications?: { ux?: Record<string, unknown> } } | undefined)
            ?.applications?.ux ?? {}),
          Tabs: TabsMock
        }
      }
    };

    vi.stubGlobal("foundry", foundryWithTabs);

    document.body.innerHTML = `
      <div class="dolmenwood-sheet__tabs">
        <button data-tab-target="main">Main</button>
        <button data-tab-target="second">Second</button>
      </div>
      <div class="dolmenwood-sheet__content">
        <div data-tab-panel="main">Main content</div>
        <div data-tab-panel="second">Second content</div>
      </div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "nonexistent");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    expect(setActiveTab).toHaveBeenCalledWith("main");
    expect(capturedConfig?.initial).toBe("main");
  });

  it("propagates Foundry Tabs callback into setActiveTab", () => {
    let capturedConfig:
      | {
          callback?: ((event: MouseEvent | null, tabs: unknown, tabName: string) => unknown) | null;
        }
      | undefined;

    class TabsMock {
      active = "main";

      constructor(config: {
        callback?: ((event: MouseEvent | null, tabs: unknown, tabName: string) => unknown) | null;
      }) {
        capturedConfig = config;
      }

      bind(_html: HTMLElement): void {}
    }

    const originalFoundry = globalThis.foundry as Record<string, unknown> | undefined;
    const foundryWithTabs = {
      ...(originalFoundry ?? {}),
      applications: {
        ...((originalFoundry as { applications?: Record<string, unknown> } | undefined)?.applications ??
          {}),
        ux: {
          ...((originalFoundry as { applications?: { ux?: Record<string, unknown> } } | undefined)
            ?.applications?.ux ?? {}),
          Tabs: TabsMock
        }
      }
    };

    vi.stubGlobal("foundry", foundryWithTabs);

    document.body.innerHTML = `
      <div class="dolmenwood-sheet__tabs">
        <button data-tab-target="main">Main</button>
        <button data-tab-target="second">Second</button>
      </div>
      <div class="dolmenwood-sheet__content">
        <div data-tab-panel="main">Main content</div>
        <div data-tab-panel="second">Second content</div>
      </div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "main");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    capturedConfig?.callback?.(null, {}, "second");

    expect(setActiveTab).toHaveBeenCalledWith("second");
  });

  it("defaults to main when tab markup is missing", () => {
    const createTabs = vi.fn();

    class TabsMock {
      active = "main";

      constructor(_config: unknown) {
        createTabs();
      }

      bind(_html: HTMLElement): void {}
    }

    const originalFoundry = globalThis.foundry as Record<string, unknown> | undefined;
    const foundryWithTabs = {
      ...(originalFoundry ?? {}),
      applications: {
        ...((originalFoundry as { applications?: Record<string, unknown> } | undefined)?.applications ??
          {}),
        ux: {
          ...((originalFoundry as { applications?: { ux?: Record<string, unknown> } } | undefined)
            ?.applications?.ux ?? {}),
          Tabs: TabsMock
        }
      }
    };

    vi.stubGlobal("foundry", foundryWithTabs);

    document.body.innerHTML = `
      <div>No tabs here</div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "something");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    expect(setActiveTab).toHaveBeenCalledWith("main");
    expect(createTabs).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from "vitest";
import { registerTabNavigationListener } from "./registerTabNavigationListener.js";

describe("registerTabNavigationListener", () => {
  it("activates the current tab and panel on initialization", () => {
    document.body.innerHTML = `
      <button data-tab-target="main">Main</button>
      <button data-tab-target="second">Second</button>
      <button data-tab-target="third">Third</button>
      <div data-tab-panel="main">Main content</div>
      <div data-tab-panel="second">Second content</div>
      <div data-tab-panel="third">Third content</div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "second");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    expect(html.find("[data-tab-target='second']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-target='main']").hasClass("is-active")).toBe(false);
    expect(html.find("[data-tab-target='third']").hasClass("is-active")).toBe(false);

    expect(html.find("[data-tab-panel='second']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-panel='main']").hasClass("is-active")).toBe(false);
    expect(html.find("[data-tab-panel='third']").hasClass("is-active")).toBe(false);
  });

  it("sets default tab when active tab does not exist", () => {
    document.body.innerHTML = `
      <button data-tab-target="main">Main</button>
      <button data-tab-target="second">Second</button>
      <div data-tab-panel="main">Main content</div>
      <div data-tab-panel="second">Second content</div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "nonexistent");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    expect(setActiveTab).toHaveBeenCalledWith("main");
    expect(getActiveTab).toHaveBeenCalled();
  });

  it("switches tabs on click", () => {
    document.body.innerHTML = `
      <button data-tab-target="main" class="is-active">Main</button>
      <button data-tab-target="second">Second</button>
      <button data-tab-target="third">Third</button>
      <div data-tab-panel="main" class="is-active">Main content</div>
      <div data-tab-panel="second">Second content</div>
      <div data-tab-panel="third">Third content</div>
    `;
    const html = $(document.body);
    let activeTab = "main";
    const getActiveTab = vi.fn(() => activeTab);
    const setActiveTab = vi.fn((tab: string) => {
      activeTab = tab;
    });

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    const secondTabButton = html.find("[data-tab-target='second']");

    secondTabButton.trigger("click");

    expect(setActiveTab).toHaveBeenCalledWith("second");
    expect(secondTabButton.hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-target='main']").hasClass("is-active")).toBe(false);
    expect(html.find("[data-tab-panel='second']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-panel='main']").hasClass("is-active")).toBe(false);
  });

  it("prevents default behavior and stops propagation on tab click", () => {
    document.body.innerHTML = `
      <button data-tab-target="main">Main</button>
      <button data-tab-target="second">Second</button>
      <div data-tab-panel="main">Main content</div>
      <div data-tab-panel="second">Second content</div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "main");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    const event = $.Event("click");
    const secondTabButton = html.find("[data-tab-target='second']");

    secondTabButton.trigger(event);

    expect(event.isDefaultPrevented()).toBe(true);
    expect(event.isPropagationStopped()).toBe(true);
  });

  it("does nothing when clicking an element without data-tab-target", () => {
    document.body.innerHTML = `
      <button data-tab-target="main" class="is-active">Main</button>
      <button data-tab-target="second">Second</button>
      <button class="no-target">No Target</button>
      <div data-tab-panel="main" class="is-active">Main content</div>
      <div data-tab-panel="second">Second content</div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "main");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    const noTargetButton = html.find(".no-target");

    noTargetButton.trigger("click");

    // setActiveTab should only be called during initialization (if needed)
    // but not from clicking the button without data-tab-target
    const callsBeforeClick = setActiveTab.mock.calls.length;

    expect(callsBeforeClick).toBe(0); // No calls during init since panel exists
  });

  it("handles multiple tab switches correctly", () => {
    document.body.innerHTML = `
      <button data-tab-target="main" class="is-active">Main</button>
      <button data-tab-target="second">Second</button>
      <button data-tab-target="third">Third</button>
      <div data-tab-panel="main" class="is-active">Main content</div>
      <div data-tab-panel="second">Second content</div>
      <div data-tab-panel="third">Third content</div>
    `;
    const html = $(document.body);
    let activeTab = "main";
    const getActiveTab = vi.fn(() => activeTab);
    const setActiveTab = vi.fn((tab: string) => {
      activeTab = tab;
    });

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    html.find("[data-tab-target='second']").trigger("click");
    expect(setActiveTab).toHaveBeenCalledWith("second");
    expect(html.find("[data-tab-target='second']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-panel='second']").hasClass("is-active")).toBe(true);

    html.find("[data-tab-target='third']").trigger("click");
    expect(setActiveTab).toHaveBeenCalledWith("third");
    expect(html.find("[data-tab-target='third']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-target='second']").hasClass("is-active")).toBe(false);
    expect(html.find("[data-tab-panel='third']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-panel='second']").hasClass("is-active")).toBe(false);

    html.find("[data-tab-target='main']").trigger("click");
    expect(setActiveTab).toHaveBeenCalledWith("main");
    expect(html.find("[data-tab-target='main']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-target='third']").hasClass("is-active")).toBe(false);
    expect(html.find("[data-tab-panel='main']").hasClass("is-active")).toBe(true);
    expect(html.find("[data-tab-panel='third']").hasClass("is-active")).toBe(false);
  });

  it("defaults to 'main' when no tabs exist", () => {
    document.body.innerHTML = `
      <div>No tabs here</div>
    `;
    const html = $(document.body);
    const getActiveTab = vi.fn(() => "something");
    const setActiveTab = vi.fn();

    registerTabNavigationListener(html, { getActiveTab, setActiveTab });

    expect(setActiveTab).toHaveBeenCalledWith("main");
  });
});

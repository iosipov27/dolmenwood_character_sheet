import { afterEach, describe, expect, it, vi } from "vitest";
import { registerEquipmentListener } from "./equipment.listener.js";

describe("registerEquipmentListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("calculates total weight from equipment weight inputs on init", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <input name="dw.meta.equipment.stowedWeight1" value="5" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html);

    const total = html.find("[data-total-weight]");

    expect(total.text()).toBe("15");
  });

  it("updates total weight when a weight input changes", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <input name="dw.meta.equipment.stowedWeight1" value="5" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html);

    const total = html.find("[data-total-weight]");
    const input = html.find('input[name="dw.meta.equipment.stowedWeight1"]');

    input.val("8");
    input.trigger("input");

    expect(total.text()).toBe("18");
  });

  it("shows tooltip for stowed item input when text is truncated", () => {
    const activate = vi.fn();
    const deactivate = vi.fn();

    vi.stubGlobal("game", {
      tooltip: { activate, deactivate }
    });

    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.stowed1" value="Very long stowed item name" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html);

    const input = html.find('input[name="dw.meta.equipment.stowed1"]').get(0) as HTMLInputElement;

    Object.defineProperty(input, "clientWidth", { configurable: true, value: 40 });
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 120 });

    $(input).trigger("mouseenter");

    expect(activate).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledWith(input, { text: "Very long stowed item name" });
    expect(deactivate).not.toHaveBeenCalled();
  });

  it("does not show tooltip for stowed item input when text fits", () => {
    const activate = vi.fn();
    const deactivate = vi.fn();

    vi.stubGlobal("game", {
      tooltip: { activate, deactivate }
    });

    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.stowed1" value="Short" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html);

    const input = html.find('input[name="dw.meta.equipment.stowed1"]').get(0) as HTMLInputElement;

    Object.defineProperty(input, "clientWidth", { configurable: true, value: 120 });
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 40 });

    $(input).trigger("mouseenter");

    expect(input.getAttribute("title")).toBeNull();
    expect(activate).not.toHaveBeenCalled();
    expect(deactivate).toHaveBeenCalledTimes(1);
  });

  it("deactivates tooltip when leaving stowed item input", () => {
    const activate = vi.fn();
    const deactivate = vi.fn();

    vi.stubGlobal("game", {
      tooltip: { activate, deactivate }
    });

    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.stowed1" value="Very long stowed item name" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html);

    const input = html.find('input[name="dw.meta.equipment.stowed1"]').get(0) as HTMLInputElement;

    Object.defineProperty(input, "clientWidth", { configurable: true, value: 40 });
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 120 });

    $(input).trigger("mouseenter");
    $(input).trigger("mouseleave");

    expect(activate).toHaveBeenCalledTimes(1);
    expect(deactivate).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it } from "vitest";
import { registerEquipmentListener } from "./equipment.listener.js";

describe("registerEquipmentListener", () => {
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
});

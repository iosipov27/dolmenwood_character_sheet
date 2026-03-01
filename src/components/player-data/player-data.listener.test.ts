import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerPlayerDataListener } from "./player-data.listener.js";

describe("registerPlayerDataListener", () => {
  it("hides the affiliation field through a dw patch", async () => {
    document.body.innerHTML = `
      <button data-action="dw-hide-optional-meta-field" data-field="affiliation"></button>
    `;
    const html = $(document.body);
    const applyDwPatch = vi.fn(async () => {});

    registerPlayerDataListener(html, { applyDwPatch });

    html.find("[data-action='dw-hide-optional-meta-field']").trigger("click");
    await flushPromises();

    expect(applyDwPatch).toHaveBeenCalledWith({
      player: {
        affiliationVisible: false
      }
    });
  });

  it("shows the moon sign field through a dw patch", async () => {
    document.body.innerHTML = `
      <button data-action="dw-show-optional-meta-field" data-field="moonSign"></button>
    `;
    const html = $(document.body);
    const applyDwPatch = vi.fn(async () => {});

    registerPlayerDataListener(html, { applyDwPatch });

    html.find("[data-action='dw-show-optional-meta-field']").trigger("click");
    await flushPromises();

    expect(applyDwPatch).toHaveBeenCalledWith({
      player: {
        moonSignVisible: true
      }
    });
  });

  it("ignores unknown optional field keys", async () => {
    document.body.innerHTML = `
      <button data-action="dw-hide-optional-meta-field" data-field="unknown"></button>
    `;
    const html = $(document.body);
    const applyDwPatch = vi.fn(async () => {});

    registerPlayerDataListener(html, { applyDwPatch });

    html.find("[data-action='dw-hide-optional-meta-field']").trigger("click");
    await flushPromises();

    expect(applyDwPatch).not.toHaveBeenCalled();
  });
});

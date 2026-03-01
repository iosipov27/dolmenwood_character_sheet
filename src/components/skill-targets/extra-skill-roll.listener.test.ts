import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerExtraSkillRollListener } from "./extra-skill-roll.listener.js";

describe("registerExtraSkillRollListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rolls extra skill on mouse down using row inputs", async () => {
    vi.stubGlobal("game", {
      i18n: {
        localize: (key: string) => (key === "DOLMENWOOD.Roll.SkillPrefix" ? "Skill" : key)
      }
    });

    document.body.innerHTML = `
      <div class="dw-skill__extra">
        <button data-action="dw-roll-extra-skill" data-name="fallback"></button>
        <input class="dw-skill__name" value="Stealth" />
        <input class="dw-target" value="8" />
      </div>
    `;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollSkillCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 8 }));

    registerExtraSkillRollListener(html, { actor, rollSkillCheck });

    html.find("[data-action='dw-roll-extra-skill']").trigger("mousedown");
    await flushPromises();

    expect(rollSkillCheck).toHaveBeenCalledTimes(1);
    expect(rollSkillCheck).toHaveBeenCalledWith(actor, "Skill: STEALTH", 8);
  });

  it("rolls extra skill for buttons added after listener registration", async () => {
    vi.stubGlobal("game", {
      i18n: {
        localize: (key: string) => (key === "DOLMENWOOD.Roll.SkillPrefix" ? "Skill" : key)
      }
    });

    document.body.innerHTML = `<div class="dw-skills"></div>`;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollSkillCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 9 }));

    registerExtraSkillRollListener(html, { actor, rollSkillCheck });

    html.find(".dw-skills").append(`
      <div class="dw-skill__extra">
        <button data-action="dw-roll-extra-skill" data-name="fallback"></button>
        <input class="dw-skill__name" value="Tracking" />
        <input class="dw-target" value="9" />
      </div>
    `);

    html.find("[data-action='dw-roll-extra-skill']").trigger("mousedown");
    await flushPromises();

    expect(rollSkillCheck).toHaveBeenCalledTimes(1);
    expect(rollSkillCheck).toHaveBeenCalledWith(actor, "Skill: TRACKING", 9);
  });
});

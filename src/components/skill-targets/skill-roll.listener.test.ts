import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSkillRollListener } from "./skill-roll.listener.js";

describe("registerSkillRollListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rolls skill with target from dw flags", async () => {
    vi.stubGlobal("game", {
      i18n: {
        localize: (key: string) => (key === "DOLMENWOOD.Roll.SkillPrefix" ? "Skill" : key)
      }
    });

    document.body.innerHTML = `<button data-action="dw-roll-skill" data-key="listen"></button>`;
    const html = $(document.body);
    const actor = {} as Actor;
    const getDwFlags = vi.fn(() => ({ skills: { listen: 7 } }) as never);
    const rollSkillCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 7 }));
    const prettyKey = vi.fn((key: string) => key.toUpperCase());

    registerSkillRollListener(html, { actor, getDwFlags, rollSkillCheck, prettyKey });

    html.find("[data-action='dw-roll-skill']").trigger("click");
    await flushPromises();

    expect(prettyKey).toHaveBeenCalledWith("listen");
    expect(rollSkillCheck).toHaveBeenCalledWith(actor, "Skill: LISTEN", 7);
  });

  it("uses default skill target 6 when flag value is missing", async () => {
    vi.stubGlobal("game", {
      i18n: {
        localize: (key: string) => (key === "DOLMENWOOD.Roll.SkillPrefix" ? "Skill" : key)
      }
    });

    document.body.innerHTML = `<button data-action="dw-roll-skill" data-key="search"></button>`;
    const html = $(document.body);
    const actor = {} as Actor;
    const getDwFlags = vi.fn(() => ({ skills: {} }) as never);
    const rollSkillCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 6 }));
    const prettyKey = vi.fn((key: string) => key.toUpperCase());

    registerSkillRollListener(html, { actor, getDwFlags, rollSkillCheck, prettyKey });

    html.find("[data-action='dw-roll-skill']").trigger("click");
    await flushPromises();

    expect(rollSkillCheck).toHaveBeenCalledWith(actor, "Skill: SEARCH", 6);
  });
});

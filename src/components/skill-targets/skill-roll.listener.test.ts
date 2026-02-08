import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSkillRollListener } from "./skill-roll.listener.js";

describe("registerSkillRollListener", () => {
  it("rolls skill with target from dw flags", async () => {
    document.body.innerHTML = `<button data-action="dw-roll-skill" data-key="listen"></button>`;
    const html = $(document.body);
    const actor = {} as Actor;
    const getDwFlags = vi.fn(() => ({ skills: { listen: 7 } }) as never);
    const rollTargetCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 7 }));
    const prettyKey = vi.fn((key: string) => key.toUpperCase());

    registerSkillRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey });

    html.find("[data-action='dw-roll-skill']").trigger("click");
    await flushPromises();

    expect(prettyKey).toHaveBeenCalledWith("listen");
    expect(rollTargetCheck).toHaveBeenCalledWith(actor, "Skill: LISTEN", 7);
  });
});

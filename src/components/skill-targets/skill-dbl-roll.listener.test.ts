import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSkillDblRollListener } from "./skill-dbl-roll.listener.js";

describe("registerSkillDblRollListener", () => {
  it("rolls skill on double click with input value", async () => {
    document.body.innerHTML = `<input data-dw-dblroll="skill" data-key="search" value="13" />`;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollTargetCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 13 }));
    const prettyKey = vi.fn((key: string) => key.toUpperCase());

    registerSkillDblRollListener(html, { actor, rollTargetCheck, prettyKey });

    html.find("input[data-dw-dblroll='skill']").trigger("dblclick");
    await flushPromises();

    expect(prettyKey).toHaveBeenCalledWith("search");
    expect(rollTargetCheck).toHaveBeenCalledWith(actor, "Skill: SEARCH", 13);
  });
});




import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerExtraSkillDblRollListener } from "./extra-skill-dbl-roll.listener.js";

describe("registerExtraSkillDblRollListener", () => {
  it("rolls extra skill on double click", async () => {
    document.body.innerHTML = `<input data-dw-dblroll="extra-skill" data-name="camping" value="10" />`;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollSkillCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 10 }));

    registerExtraSkillDblRollListener(html, { actor, rollSkillCheck });

    html.find("input[data-dw-dblroll='extra-skill']").trigger("dblclick");
    await flushPromises();

    expect(rollSkillCheck).toHaveBeenCalledTimes(1);
    expect(rollSkillCheck).toHaveBeenCalledWith(actor, "Skill: CAMPING", 10);
  });
});

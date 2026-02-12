import { afterEach, describe, expect, it, vi } from "vitest";
import { RollChecks } from "./rollChecks.js";

describe("RollChecks.rollAbilityCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses 1d6 plus modifier and succeeds on 4 or higher", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.Roll.AbilityPrefix": "Ability",
      "DOLMENWOOD.Roll.Success": "Success",
      "DOLMENWOOD.Roll.Fail": "Fail"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const builtRolls: Array<{ formula: string; mod: number }> = [];
    const postedMessage = vi.fn(async () => {});
    const getSpeaker = vi.fn(() => ({ alias: "Actor" }));

    class MockRoll {
      total = 4;
      dice = [{ results: [{ result: 2 }] }];

      constructor(formula: string, data: { mod: number }) {
        builtRolls.push({ formula, mod: data.mod });
      }

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(payload: unknown): Promise<void> {
        await postedMessage(payload);
      }
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker });

    const actor = {} as Actor;
    const result = await RollChecks.rollAbilityCheck(actor, "Strength", 2);

    expect(builtRolls).toEqual([{ formula: "1d6 + @mod", mod: 2 }]);
    expect(result.success).toBe(true);
    expect(result.target).toBe(4);
    expect(getSpeaker).toHaveBeenCalledWith({ actor });
    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining("1d6 + 2 = <b>4</b> - <b>4</b> >= <b>4</b>")
      })
    );
  });

  it("fails when the final roll is below 4", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    class MockRoll {
      total = 3;
      dice = [{ results: [{ result: 4 }] }];

      constructor(_formula: string, _data: { mod: number }) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(_payload: unknown): Promise<void> {}
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    const result = await RollChecks.rollAbilityCheck({} as Actor, "Dexterity", -1);

    expect(result.success).toBe(false);
    expect(result.target).toBe(4);
  });

  it("always fails on natural 1 regardless of modifier", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    class MockRoll {
      total = 7;
      dice = [{ results: [{ result: 1 }] }];

      constructor(_formula: string, _data: { mod: number }) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(_payload: unknown): Promise<void> {}
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    const result = await RollChecks.rollAbilityCheck({} as Actor, "Strength", 6);

    expect(result.success).toBe(false);
  });

  it("always succeeds on natural 6 regardless of modifier", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    class MockRoll {
      total = 1;
      dice = [{ results: [{ result: 6 }] }];

      constructor(_formula: string, _data: { mod: number }) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(_payload: unknown): Promise<void> {}
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    const result = await RollChecks.rollAbilityCheck({} as Actor, "Dexterity", -5);

    expect(result.success).toBe(true);
  });
});

describe("RollChecks.rollSkillCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses 1d6 and succeeds when roll is equal or higher than skill value", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    const postedMessage = vi.fn(async () => {});
    const getSpeaker = vi.fn(() => ({ alias: "Actor" }));

    class MockRoll {
      total = 5;
      dice = [{ results: [{ result: 5 }] }];

      constructor(formula: string) {
        expect(formula).toBe("1d6");
      }

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(payload: unknown): Promise<void> {
        await postedMessage(payload);
      }
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker });

    const result = await RollChecks.rollSkillCheck({} as Actor, "Skill: LISTEN", 5);

    expect(result.success).toBe(true);
    expect(result.target).toBe(5);
    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining("1d6 = <b>5</b> - <b>5</b> >= <b>5</b>")
      })
    );
  });

  it("always fails on natural 1", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    class MockRoll {
      total = 6;
      dice = [{ results: [{ result: 1 }] }];

      constructor(_formula: string) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(_payload: unknown): Promise<void> {}
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    const result = await RollChecks.rollSkillCheck({} as Actor, "Skill: SEARCH", 2);
    expect(result.success).toBe(false);
  });

  it("always succeeds on natural 6", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    class MockRoll {
      total = 1;
      dice = [{ results: [{ result: 6 }] }];

      constructor(_formula: string) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(_payload: unknown): Promise<void> {}
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    const result = await RollChecks.rollSkillCheck({} as Actor, "Skill: SURVIVAL", 6);
    expect(result.success).toBe(true);
  });

  it("uses default skill target 6 when provided value is invalid", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });

    class MockRoll {
      total = 5;
      dice = [{ results: [{ result: 5 }] }];

      constructor(_formula: string) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(_payload: unknown): Promise<void> {}
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    const result = await RollChecks.rollSkillCheck({} as Actor, "Skill: TRACKING", 0);
    expect(result.target).toBe(6);
    expect(result.success).toBe(false);
  });
});

describe("RollChecks.rollAttackCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses 1d20 with modifier and posts attack flavor", async () => {
    const builtRolls: Array<{ formula: string; mod: number }> = [];
    const postedMessage = vi.fn(async () => {});
    const getSpeaker = vi.fn(() => ({ alias: "Actor" }));

    class MockRoll {
      constructor(formula: string, data: { mod: number }) {
        builtRolls.push({ formula, mod: data.mod });
      }

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(payload: unknown): Promise<void> {
        await postedMessage(payload);
      }
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker });

    const actor = {} as Actor;
    const result = await RollChecks.rollAttackCheck(actor, "Melee Attack", "Strength", -1);

    expect(builtRolls).toEqual([{ formula: "1d20 + @mod", mod: -1 }]);
    expect(result.mod).toBe(-1);
    expect(getSpeaker).toHaveBeenCalledWith({ actor });
    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining("1d20 - <b>1</b> (Strength)")
      })
    );
  });

  it("always fails on natural 1 regardless of modifier", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.Roll.Success": "SUCCESS",
      "DOLMENWOOD.Roll.Fail": "FAIL"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const postedMessage = vi.fn(async () => {});

    class MockRoll {
      dice = [{ results: [{ result: 1 }] }];

      constructor(_formula: string, _data: { mod: number }) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(payload: unknown): Promise<void> {
        await postedMessage(payload);
      }
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    await RollChecks.rollAttackCheck({} as Actor, "Melee Attack", "Strength", 9);

    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining("d20 <b>1</b> => auto fail")
      })
    );
    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining('<span class="dw-fail">FAIL</span>')
      })
    );
  });

  it("always succeeds on natural 20 regardless of modifier", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.Roll.Success": "SUCCESS",
      "DOLMENWOOD.Roll.Fail": "FAIL"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const postedMessage = vi.fn(async () => {});

    class MockRoll {
      dice = [{ results: [{ result: 20 }] }];

      constructor(_formula: string, _data: { mod: number }) {}

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(payload: unknown): Promise<void> {
        await postedMessage(payload);
      }
    }

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker: () => ({}) });

    await RollChecks.rollAttackCheck({} as Actor, "Ranged Attack", "Dexterity", -8);

    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining("d20 <b>20</b> => auto success")
      })
    );
    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flavor: expect.stringContaining('<span class="dw-success">SUCCESS</span>')
      })
    );
  });
});

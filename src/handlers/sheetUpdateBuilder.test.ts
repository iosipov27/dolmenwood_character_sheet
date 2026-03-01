import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { buildDwUpdatePayload, buildFieldUpdatePayload } from "./sheetUpdateBuilder.js";
import type { DwFlags } from "../types/index.js";
import * as dwSchemaModule from "../models/dwSchema.js";
import { MODULE_ID } from "../constants/moduleId.js";

vi.mock("../models/dwSchema.js");

describe("sheetUpdateBuilder", () => {
  let mockActor: Actor;
  let mockGetFlag: Mock;
  let cleanDwFlagsWithSchemaMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetFlag = vi.fn().mockReturnValue({});
    mockActor = {
      getFlag: mockGetFlag,
      system: {
        ac: { value: 9, mod: 0 },
        aac: { value: 10, mod: 0 }
      }
    } as unknown as Actor;

    cleanDwFlagsWithSchemaMock = vi.mocked(dwSchemaModule.cleanDwFlagsWithSchema);
    cleanDwFlagsWithSchemaMock.mockImplementation((flags) => flags as DwFlags);
  });

  describe("buildDwUpdatePayload", () => {
    it("merges current stored dw before schema clean", () => {
      mockGetFlag.mockReturnValue({
        meta: {
          otherNotes: "<p>Keep me</p>"
        }
      } as Partial<DwFlags>);

      buildDwUpdatePayload(mockActor, {
        meta: {
          xp: "1200"
        }
      });

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            xp: "1200",
            otherNotes: "<p>Keep me</p>"
          })
        })
      );
    });

    it("returns a single actor update payload for dw changes", () => {
      const cleaned = {
        extraSkills: [{ name: "Tracking", target: 8 }]
      } as unknown as DwFlags;

      cleanDwFlagsWithSchemaMock.mockReturnValue(cleaned);

      const result = buildDwUpdatePayload(mockActor, {
        extraSkills: {
          0: {
            name: "Tracking",
            target: "8"
          }
        }
      });

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          extraSkills: {
            0: { name: "Tracking", target: "8" }
          }
        })
      );
      expect(result).toEqual({
        [`flags.${MODULE_ID}.dw`]: cleaned
      });
    });

    it("does not include dw flags when schema clean returns null", () => {
      cleanDwFlagsWithSchemaMock.mockReturnValue(null);

      const result = buildDwUpdatePayload(mockActor, {
        meta: {
          xp: "800"
        }
      });

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });
  });

  describe("buildFieldUpdatePayload", () => {
    it("returns a plain actor update for non-dw fields", () => {
      const result = buildFieldUpdatePayload(mockActor, "name", "Goblin");

      expect(cleanDwFlagsWithSchemaMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        name: "Goblin"
      });
    });

    it("converts dw field paths into a dw actor update payload", () => {
      const cleaned = {
        meta: {
          xp: 800
        }
      } as unknown as DwFlags;

      cleanDwFlagsWithSchemaMock.mockReturnValue(cleaned);

      const result = buildFieldUpdatePayload(mockActor, "dw.meta.xp", "800");

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            xp: "800"
          })
        })
      );
      expect(result).toEqual({
        [`flags.${MODULE_ID}.dw`]: cleaned
      });
    });

    it("ignores module flags dw payload", () => {
      const result = buildFieldUpdatePayload(
        mockActor,
        `flags.${MODULE_ID}.dw.meta.otherNotes`,
        "<p>Some notes</p>"
      );

      expect(cleanDwFlagsWithSchemaMock).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("remaps descending AC edits to AC mod", () => {
      const result = buildFieldUpdatePayload(mockActor, "system.ac.value", "7");

      expect(result).not.toHaveProperty("system.ac.value");
      expect(result).toHaveProperty("system.ac.mod", 2);
    });

    it("remaps ascending AC edits to AAC mod", () => {
      mockActor = {
        getFlag: mockGetFlag,
        system: {
          ac: { value: 9, mod: 0 },
          aac: { value: 13, mod: 1 }
        }
      } as unknown as Actor;

      const result = buildFieldUpdatePayload(mockActor, "system.aac.value", "15");

      expect(result).not.toHaveProperty("system.aac.value");
      expect(result).toHaveProperty("system.aac.mod", 3);
    });
  });
});

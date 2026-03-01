import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { FormDataHandler } from "./formDataHandler.js";
import type { DwFlags } from "../types.js";
import * as dwSchemaModule from "../models/dwSchema.js";
import { MODULE_ID } from "../constants/moduleId.js";

vi.mock("../models/dwSchema.js");

describe("FormDataHandler", () => {
  let mockActor: Actor;
  let mockGetFlag: Mock;
  let cleanDwFlagsWithSchemaMock: Mock;
  let handler: FormDataHandler;

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

    handler = new FormDataHandler(mockActor);
  });

  describe("handleFormData", () => {
    it("returns unchanged payload when no dw data is submitted", async () => {
      const formData = {
        name: "Goblin",
        "system.hp.value": 5
      };

      const result = await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).not.toHaveBeenCalled();
      expect(result).toEqual(formData);
    });

    it("cleans dw payload from form fields and returns a single actor update payload", async () => {
      const formData = {
        name: "Ranger",
        "dw.extraSkills.0.name": "Tracking",
        "dw.extraSkills.0.target": "8"
      };
      const cleaned = {
        extraSkills: [{ name: "Tracking", target: 8 }]
      } as unknown as DwFlags;

      cleanDwFlagsWithSchemaMock.mockReturnValue(cleaned);

      const result = await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          extraSkills: [{ name: "Tracking", target: "8" }]
        })
      );
      expect(result).toEqual({
        name: "Ranger",
        [`flags.${MODULE_ID}.dw`]: cleaned
      });
    });

    it("ignores module flags dw payload", async () => {
      const formData = {
        [`flags.${MODULE_ID}.dw.meta.otherNotes`]: "<p>Some notes</p>"
      };

      const result = await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("merges current stored dw before schema clean", async () => {
      mockGetFlag.mockReturnValue({
        meta: {
          otherNotes: "<p>Keep me</p>"
        }
      } as Partial<DwFlags>);

      const formData = {
        "dw.meta.xp": "1200"
      };

      await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            xp: "1200",
            otherNotes: "<p>Keep me</p>"
          })
        })
      );
    });

    it("does not include dw flags when schema clean returns null", async () => {
      cleanDwFlagsWithSchemaMock.mockReturnValue(null);

      const result = await handler.handleFormData({
        "dw.meta.xp": "800"
      });

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });

    it("remaps descending AC edits to AC mod", async () => {
      const result = await handler.handleFormData({
        "system.ac.value": "7"
      });

      expect(result).not.toHaveProperty("system.ac.value");
      expect(result).toHaveProperty("system.ac.mod", 2);
    });

    it("remaps ascending AC edits to AAC mod", async () => {
      mockActor = {
        getFlag: mockGetFlag,
        system: {
          ac: { value: 9, mod: 0 },
          aac: { value: 13, mod: 1 }
        }
      } as unknown as Actor;
      handler = new FormDataHandler(mockActor);

      const result = await handler.handleFormData({
        "system.aac.value": "15"
      });

      expect(result).not.toHaveProperty("system.aac.value");
      expect(result).toHaveProperty("system.aac.mod", 3);
    });
  });

  describe("handleDwPatch", () => {
    it("returns dw update payload for listeners", async () => {
      const cleaned = {
        meta: {
          spellsCollapsed: true
        }
      } as unknown as DwFlags;

      cleanDwFlagsWithSchemaMock.mockReturnValue(cleaned);

      const result = await handler.handleDwPatch({
        meta: {
          spellsCollapsed: true
        }
      });

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalled();
      expect(result).toEqual({
        [`flags.${MODULE_ID}.dw`]: cleaned
      });
    });
  });
});

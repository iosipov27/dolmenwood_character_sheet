import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { FormDataHandler } from "./formDataHandler.js";
import type { DwFlags } from "../types.js";
import * as dwSchemaModule from "../models/dwSchema.js";
import { MODULE_ID } from "../constants/moduleId.js";

vi.mock("../models/dwSchema.js");

describe("FormDataHandler", () => {
  let mockRepository: {
    get: Mock;
    set: Mock;
  };
  let mockActor: Actor;
  let cleanDwFlagsWithSchemaMock: Mock;
  let handler: FormDataHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      get: vi.fn().mockReturnValue({}),
      set: vi.fn().mockResolvedValue(undefined)
    };
    mockActor = {
      system: {
        ac: { value: 9, mod: 0 },
        aac: { value: 10, mod: 0 }
      }
    } as unknown as Actor;

    cleanDwFlagsWithSchemaMock = vi.mocked(dwSchemaModule.cleanDwFlagsWithSchema);
    cleanDwFlagsWithSchemaMock.mockImplementation((flags) => flags as DwFlags);

    handler = new FormDataHandler(mockRepository as never, mockActor);
  });

  describe("handleFormData", () => {
    it("returns unchanged payload when no dw data is submitted", async () => {
      const formData = {
        name: "Goblin",
        "system.hp.value": 5
      };

      const result = await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).not.toHaveBeenCalled();
      expect(mockRepository.set).not.toHaveBeenCalled();
      expect(result).toEqual(formData);
    });

    it("cleans and saves dw payload from form fields", async () => {
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
      expect(mockRepository.set).toHaveBeenCalledWith(cleaned);
      expect(result).toEqual({ name: "Ranger" });
    });

    it("cleans and saves dw payload from module flags (editor fields)", async () => {
      const formData = {
        [`flags.${MODULE_ID}.dw.meta.otherNotes`]: "<p>Some notes</p>"
      };
      const cleaned = {
        meta: {
          otherNotes: "<p>Some notes</p>"
        }
      } as unknown as DwFlags;

      cleanDwFlagsWithSchemaMock.mockReturnValue(cleaned);

      const result = await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            otherNotes: "<p>Some notes</p>"
          })
        })
      );
      expect(mockRepository.set).toHaveBeenCalledWith(cleaned);
      expect(result).toEqual({});
    });

    it("merges current stored dw before schema clean", async () => {
      mockRepository.get.mockReturnValue({
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

    it("merges dw and module-flag dw patches before schema clean", async () => {
      const formData = {
        "dw.meta.xp": "1200",
        [`flags.${MODULE_ID}.dw.meta.kindredClassTraits`]: "<p>Trait text</p>"
      };

      await handler.handleFormData(formData);

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            xp: "1200",
            kindredClassTraits: "<p>Trait text</p>"
          })
        })
      );
    });

    it("does not write flags when schema clean returns null", async () => {
      cleanDwFlagsWithSchemaMock.mockReturnValue(null);

      await handler.handleFormData({
        "dw.meta.xp": "800"
      });

      expect(cleanDwFlagsWithSchemaMock).toHaveBeenCalledTimes(1);
      expect(mockRepository.set).not.toHaveBeenCalled();
    });

    it("propagates repository write errors", async () => {
      const error = new Error("Failed to save");

      mockRepository.set.mockRejectedValue(error);

      await expect(
        handler.handleFormData({
          "dw.languages.0": "Elvish"
        })
      ).rejects.toThrow("Failed to save");
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
        system: {
          ac: { value: 9, mod: 0 },
          aac: { value: 13, mod: 1 }
        }
      } as unknown as Actor;
      handler = new FormDataHandler(mockRepository as never, mockActor);

      const result = await handler.handleFormData({
        "system.aac.value": "15"
      });

      expect(result).not.toHaveProperty("system.aac.value");
      expect(result).toHaveProperty("system.aac.mod", 3);
    });
  });
});

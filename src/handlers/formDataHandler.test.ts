import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { FormDataHandler } from "./formDataHandler.js";
import type { DwFlags } from "../types.js";
import * as normalizeDwFlagsModule from "../utils/normalizeDwFlags.js";

vi.mock("../utils/normalizeDwFlags.js");

describe("FormDataHandler", () => {
  let mockRepository: {
    get: Mock;
    set: Mock;
  };
  let mockActor: Actor;
  let normalizeDwFlagsMock: Mock;
  let handler: FormDataHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      get: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined)
    };
    mockActor = {
      system: {
        ac: { value: 9, mod: 0 },
        aac: { value: 10, mod: 0 }
      }
    } as unknown as Actor;

    normalizeDwFlagsMock = vi.mocked(normalizeDwFlagsModule.normalizeDwFlags);
    normalizeDwFlagsMock.mockImplementation((flags) => flags as DwFlags);

    handler = new FormDataHandler(mockRepository as never, mockActor);
  });

  describe("handleFormData", () => {
    it("should process form data without dw field", async () => {
      const formData = {
        name: "Goblin",
        "system.hp.value": 5
      };

      const result = await handler.handleFormData(formData);

      expect(normalizeDwFlagsMock).not.toHaveBeenCalled();
      expect(mockRepository.set).not.toHaveBeenCalled();
      expect(result).toEqual(formData);
    });

    it("should process form data with dw field and save flags", async () => {
      const dwFlags = {
        extraSkills: [{ name: "Tracking", target: 8 }]
      };

      const formData = {
        name: "Ranger",
        "dw.extraSkills.0.name": "Tracking",
        "dw.extraSkills.0.target": "8"
      };

      const normalizedFlags = { ...dwFlags } as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(normalizedFlags);

      const result = await handler.handleFormData(formData);

      expect(normalizeDwFlagsMock).toHaveBeenCalledTimes(1);
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          extraSkills: [{ name: "Tracking", target: "8" }]
        })
      );
      expect(mockRepository.set).toHaveBeenCalledWith(normalizedFlags);
      expect(result).not.toHaveProperty("dw");
      expect(result).toHaveProperty("name", "Ranger");
    });

    it("should remove dw field from result", async () => {
      const formData = {
        name: "Test",
        "dw.languages.0": "Common"
      };

      const result = await handler.handleFormData(formData);

      expect(result).not.toHaveProperty("dw");
      expect(Object.keys(result)).not.toContain("dw");
    });

    it("should handle empty dw object", async () => {
      const formData = {
        name: "Test"
      };

      const result = await handler.handleFormData(formData);

      expect(normalizeDwFlagsMock).not.toHaveBeenCalled();
      expect(mockRepository.set).not.toHaveBeenCalled();
      expect(result).toEqual(formData);
    });

    it("should normalize dw flags before saving", async () => {
      const formData = {
        "dw.kindredTraits.0": "fleet footed",
        "dw.classTraits.0": "backstab"
      };

      const normalizedFlags = {
        kindredTraits: ["fleet footed"],
        classTraits: ["backstab"]
      } as unknown as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(normalizedFlags);

      await handler.handleFormData(formData);

      expect(normalizeDwFlagsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          kindredTraits: ["fleet footed"],
          classTraits: ["backstab"]
        })
      );
      expect(mockRepository.set).toHaveBeenCalledWith(normalizedFlags);
    });

    it("should handle complex nested form data", async () => {
      const formData = {
        name: "Wizard",
        "system.hp.value": 10,
        "system.hp.max": 12,
        "dw.extraSkills.0.name": "Lore",
        "dw.extraSkills.0.target": "15",
        "dw.extraSkills.1.name": "Magic",
        "dw.extraSkills.1.target": "18"
      };

      const normalizedFlags = {
        extraSkills: [
          { name: "Lore", target: "15" },
          { name: "Magic", target: "18" }
        ]
      } as unknown as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(normalizedFlags);

      const result = await handler.handleFormData(formData);

      expect(mockRepository.set).toHaveBeenCalledWith(normalizedFlags);
      expect(result).not.toHaveProperty("dw");
      expect(result).toHaveProperty("name", "Wizard");
      expect(result).toHaveProperty("system.hp.value", 10);
      expect(result).toHaveProperty("system.hp.max", 12);
    });

    it("should handle repository errors gracefully", async () => {
      const formData = {
        "dw.languages.0": "Elvish"
      };

      const error = new Error("Failed to save");

      mockRepository.set.mockRejectedValue(error);

      await expect(handler.handleFormData(formData)).rejects.toThrow("Failed to save");
    });

    it("should not call repository.set when dw field is falsy", async () => {
      const formData = {
        name: "Test",
        "system.level": 5
      };

      await handler.handleFormData(formData);

      expect(mockRepository.set).not.toHaveBeenCalled();
      expect(normalizeDwFlagsMock).not.toHaveBeenCalled();
    });

    it("should expand and flatten objects correctly", async () => {
      const formData = {
        "actor.name": "Hero",
        "actor.level": 3,
        "actor.class": "Fighter"
      };

      const result = await handler.handleFormData(formData);

      expect(result).toEqual(formData);
    });

    it("should process multiple dw properties", async () => {
      const formData = {
        "dw.kindredTraits.0": "woodwose",
        "dw.kindredTraits.1": "fleet footed",
        "dw.classTraits.0": "backstab",
        "dw.languages.0": "common",
        "dw.languages.1": "elvish"
      };

      const normalizedFlags = {
        kindredTraits: ["woodwose", "fleet footed"],
        classTraits: ["backstab"],
        languages: ["common", "elvish"]
      } as unknown as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(normalizedFlags);

      const result = await handler.handleFormData(formData);

      expect(normalizeDwFlagsMock).toHaveBeenCalled();
      expect(mockRepository.set).toHaveBeenCalledWith(normalizedFlags);
      expect(result).toEqual({});
    });

    it("should remap descending AC value edits to AC mod", async () => {
      const formData = {
        "system.ac.value": "7"
      };

      const result = await handler.handleFormData(formData);

      expect(result).not.toHaveProperty("system.ac.value");
      expect(result).toHaveProperty("system.ac.mod", 2);
    });

    it("should remap ascending AC value edits to AAC mod", async () => {
      mockActor = {
        system: {
          ac: { value: 9, mod: 0 },
          aac: { value: 13, mod: 1 }
        }
      } as unknown as Actor;
      handler = new FormDataHandler(mockRepository as never, mockActor);

      const formData = {
        "system.aac.value": "15"
      };

      const result = await handler.handleFormData(formData);

      expect(result).not.toHaveProperty("system.aac.value");
      expect(result).toHaveProperty("system.aac.mod", 3);
    });
  });
});

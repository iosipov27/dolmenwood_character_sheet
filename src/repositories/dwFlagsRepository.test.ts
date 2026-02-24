import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readDwFlags, writeDwFlags } from "./dwFlagsRepository.js";
import type { DwFlags } from "../types/index.js";
import * as normalizeDwFlagsModule from "../utils/normalizeDwFlags.js";
import * as reportErrorModule from "../utils/reportError.js";
import { MODULE_ID } from "../constants/moduleId.js";

vi.mock("../utils/normalizeDwFlags.js");
vi.mock("../utils/reportError.js");

type MockActor = {
  getFlag?: Mock;
  setFlag?: Mock;
};

describe("dwFlagsRepository", () => {
  let mockActor: MockActor;
  let normalizeDwFlagsMock: Mock;
  let reportErrorMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockActor = {};
    normalizeDwFlagsMock = vi.mocked(normalizeDwFlagsModule.normalizeDwFlags);
    reportErrorMock = vi.mocked(reportErrorModule.reportError);

    normalizeDwFlagsMock.mockImplementation((flags) => flags as DwFlags);
    reportErrorMock.mockImplementation(() => {});
  });

  describe("readDwFlags", () => {
    it("returns normalized flags when actor has dolmenwood flags", () => {
      const expectedFlags: Partial<DwFlags> = {
        extraSkills: [{ name: "Tracking", target: 8 }]
      };

      mockActor.getFlag = vi.fn().mockReturnValue(expectedFlags);

      const result = readDwFlags(mockActor as never);

      expect(mockActor.getFlag).toHaveBeenCalledWith(MODULE_ID, "dw");
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith(expectedFlags);
      expect(result).toBe(expectedFlags);
    });

    it("returns normalized empty flags when actor has no flags", () => {
      mockActor.getFlag = vi.fn().mockReturnValue(undefined);

      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const result = readDwFlags(mockActor as never);

      expect(mockActor.getFlag).toHaveBeenCalledWith(MODULE_ID, "dw");
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });

    it("returns normalized empty flags when actor has no getFlag method", () => {
      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const result = readDwFlags(mockActor as never);

      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });

    it("handles errors and returns normalized empty flags", () => {
      const error = new Error("Failed to get flag");

      mockActor.getFlag = vi.fn().mockImplementation(() => {
        throw error;
      });

      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const result = readDwFlags(mockActor as never);

      expect(reportErrorMock).toHaveBeenCalledWith(
        "Failed to read dolmenwood flags from actor.",
        error
      );
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });

    it("normalizes flags even when getFlag returns null", () => {
      mockActor.getFlag = vi.fn().mockReturnValue(null);

      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const result = readDwFlags(mockActor as never);

      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });
  });

  describe("writeDwFlags", () => {
    it("sets flags on actor successfully", async () => {
      const flags: DwFlags = {
        extraSkills: [{ name: "Hunting", target: 10 }]
      } as DwFlags;

      mockActor.setFlag = vi.fn().mockResolvedValue(undefined);

      await writeDwFlags(mockActor as never, flags);

      expect(mockActor.setFlag).toHaveBeenCalledWith(MODULE_ID, "dw", flags);
      expect(reportErrorMock).not.toHaveBeenCalled();
    });

    it("does nothing when actor has no setFlag method", async () => {
      const flags: DwFlags = {} as DwFlags;

      await writeDwFlags(mockActor as never, flags);

      expect(reportErrorMock).not.toHaveBeenCalled();
    });

    it("handles errors when setting flags fails", async () => {
      const flags: DwFlags = {} as DwFlags;
      const error = new Error("Failed to set flag");

      mockActor.setFlag = vi.fn().mockImplementation(() => {
        throw error;
      });

      await writeDwFlags(mockActor as never, flags);

      expect(reportErrorMock).toHaveBeenCalledWith(
        "Failed to write dolmenwood flags to actor.",
        error
      );
    });

    it("handles promise rejection", async () => {
      const flags: DwFlags = {} as DwFlags;
      const error = new Error("Async failure");

      mockActor.setFlag = vi.fn().mockRejectedValue(error);

      await writeDwFlags(mockActor as never, flags);

      expect(reportErrorMock).toHaveBeenCalledWith(
        "Failed to write dolmenwood flags to actor.",
        error
      );
    });
  });

  describe("integration", () => {
    it("works with full flags object", async () => {
      const fullFlags = {
        extraSkills: [
          { name: "Bushcraft", target: 7 },
          { name: "Sneaking", target: 9 }
        ],
        kindredTraits: ["fleet footed"],
        classTraits: ["backstab"],
        languages: ["common", "elvish"]
      } as unknown as DwFlags;

      mockActor.getFlag = vi.fn().mockReturnValue(fullFlags);
      mockActor.setFlag = vi.fn().mockResolvedValue(undefined);
      normalizeDwFlagsMock.mockReturnValue(fullFlags);

      const retrievedFlags = readDwFlags(mockActor as never);

      expect(retrievedFlags).toBe(fullFlags);

      await writeDwFlags(mockActor as never, fullFlags);
      expect(mockActor.setFlag).toHaveBeenCalledWith(MODULE_ID, "dw", fullFlags);
    });
  });
});

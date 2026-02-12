import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { DwFlagsRepository } from "./dwFlagsRepository.js";
import type { DwFlags } from "../types.js";
import * as normalizeDwFlagsModule from "../utils/normalizeDwFlags.js";
import * as reportErrorModule from "../utils/reportError.js";
import { MODULE_ID } from "../constants/moduleId.js";

vi.mock("../utils/normalizeDwFlags.js");
vi.mock("../utils/reportError.js");

type MockActor = {
  getFlag?: Mock;
  setFlag?: Mock;
};

describe("DwFlagsRepository", () => {
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

  describe("get", () => {
    it("should return normalized flags when actor has dolmenwood flags", () => {
      const expectedFlags: Partial<DwFlags> = {
        extraSkills: [{ name: "Tracking", target: 8 }]
      };

      mockActor.getFlag = vi.fn().mockReturnValue(expectedFlags);

      const repository = new DwFlagsRepository(mockActor as never);
      const result = repository.get();

      expect(mockActor.getFlag).toHaveBeenCalledWith(MODULE_ID, "dw");
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith(expectedFlags);
      expect(result).toBe(expectedFlags);
    });

    it("should return normalized empty flags when actor has no flags", () => {
      mockActor.getFlag = vi.fn().mockReturnValue(undefined);

      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const repository = new DwFlagsRepository(mockActor as never);
      const result = repository.get();

      expect(mockActor.getFlag).toHaveBeenCalledWith(MODULE_ID, "dw");
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });

    it("should return normalized empty flags when actor has no getFlag method", () => {
      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const repository = new DwFlagsRepository(mockActor as never);
      const result = repository.get();

      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });

    it("should handle errors and return normalized empty flags", () => {
      const error = new Error("Failed to get flag");

      mockActor.getFlag = vi.fn().mockImplementation(() => {
        throw error;
      });

      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const repository = new DwFlagsRepository(mockActor as never);
      const result = repository.get();

      expect(reportErrorMock).toHaveBeenCalledWith(
        "Failed to read dolmenwood flags from actor.",
        error
      );
      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });

    it("should normalize flags even when getFlag returns null", () => {
      mockActor.getFlag = vi.fn().mockReturnValue(null);

      const expectedNormalized: DwFlags = {} as DwFlags;

      normalizeDwFlagsMock.mockReturnValue(expectedNormalized);

      const repository = new DwFlagsRepository(mockActor as never);
      const result = repository.get();

      expect(normalizeDwFlagsMock).toHaveBeenCalledWith({});
      expect(result).toBe(expectedNormalized);
    });
  });

  describe("set", () => {
    it("should set flags on actor successfully", async () => {
      const flags: DwFlags = {
        extraSkills: [{ name: "Hunting", target: 10 }]
      } as DwFlags;

      mockActor.setFlag = vi.fn().mockResolvedValue(undefined);

      const repository = new DwFlagsRepository(mockActor as never);

      await repository.set(flags);

      expect(mockActor.setFlag).toHaveBeenCalledWith(MODULE_ID, "dw", flags);
      expect(reportErrorMock).not.toHaveBeenCalled();
    });

    it("should do nothing when actor has no setFlag method", async () => {
      const flags: DwFlags = {} as DwFlags;

      const repository = new DwFlagsRepository(mockActor as never);

      await repository.set(flags);

      expect(reportErrorMock).not.toHaveBeenCalled();
    });

    it("should handle errors when setting flags fails", async () => {
      const flags: DwFlags = {} as DwFlags;
      const error = new Error("Failed to set flag");

      mockActor.setFlag = vi.fn().mockImplementation(() => {
        throw error;
      });

      const repository = new DwFlagsRepository(mockActor as never);

      await repository.set(flags);

      expect(reportErrorMock).toHaveBeenCalledWith(
        "Failed to write dolmenwood flags to actor.",
        error
      );
    });

    it("should handle promise rejection", async () => {
      const flags: DwFlags = {} as DwFlags;
      const error = new Error("Async failure");

      mockActor.setFlag = vi.fn().mockRejectedValue(error);

      const repository = new DwFlagsRepository(mockActor as never);

      await repository.set(flags);

      expect(reportErrorMock).toHaveBeenCalledWith(
        "Failed to write dolmenwood flags to actor.",
        error
      );
    });
  });

  describe("integration", () => {
    it("should work with full flags object", async () => {
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

      const repository = new DwFlagsRepository(mockActor as never);

      const retrievedFlags = repository.get();

      expect(retrievedFlags).toBe(fullFlags);

      await repository.set(fullFlags);
      expect(mockActor.setFlag).toHaveBeenCalledWith(MODULE_ID, "dw", fullFlags);
    });
  });
});

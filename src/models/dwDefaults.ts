import type { DwFlags } from "../types.js";

export function dwDefaults(): DwFlags {
  return {
    saves: {
      doom: 0,
      hold: 0,
      spell: 0,
      ray: 0,
      blast: 0,
      magic: 0
    },
    skills: { listen: 0, search: 0, survival: 0 },
    extraSkills: [],
    movement: {
      speed: 0,
      exploring: 0,
      overland: 0
    },
    combat: {
      attack: 0
    },
    meta: {
      kindredClass: "",
      kindredClassTraits: "",
      background: "",
      alignment: "",
      affiliation: "",
      moonSign: "",
      languages: "",
      xp: 0,
      level: 1,
      nextLevel: 0,
      modifier: 0
    }
  };
}

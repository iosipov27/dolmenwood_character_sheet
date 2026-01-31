export function buildCombat(systemData) {
  const wrapper = { system: systemData };
  const acCandidates = [
    "system.attributes.ac.value",
    "system.attributes.ac.current",
    "system.ac.value",
    "system.ac.current",
    "system.ac"
  ];
  const atkCandidates = [
    // Common for OSE-like systems
    "system.attributes.attack.value",
    "system.attributes.attack.bonus",
    "system.attributes.attack",
    "system.attack.value",
    "system.attack.bonus",
    "system.attack"
  ];
  const detectNumberPath = (candidates) => {
    for (const p of candidates) {
      const v = foundry.utils.getProperty(wrapper, p);
      if (typeof v === "number") return p;
    }
    return null;
  };
  const acPath = detectNumberPath(acCandidates);
  const atkPath = detectNumberPath(atkCandidates);
  const ac = acPath ? foundry.utils.getProperty(wrapper, acPath) : null;
  const attack = atkPath ? foundry.utils.getProperty(wrapper, atkPath) : null;
  return {
    ac,
    attack,
    nameAc: acPath ?? "",
    nameAttack: atkPath ?? "",
    hasAc: Boolean(acPath),
    hasAttack: Boolean(atkPath)
  };
}
//# sourceMappingURL=buildCombat.js.map

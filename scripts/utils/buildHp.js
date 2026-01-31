export function buildHp(systemData) {
  const wrapper = { system: systemData };
  // candidates for current HP
  const curCandidates = [
    "system.attributes.hp.value",
    "system.attributes.hp.current",
    "system.hp.value",
    "system.hp.current",
    "system.hp"
  ];
  // candidates for max HP
  const maxCandidates = ["system.attributes.hp.max", "system.hp.max"];
  let currentPath = null;
  let maxPath = null;
  for (const p of curCandidates) {
    const v = foundry.utils.getProperty(wrapper, p);
    if (typeof v === "number") {
      currentPath = p;
      break;
    }
  }
  for (const p of maxCandidates) {
    const v = foundry.utils.getProperty(wrapper, p);
    if (typeof v === "number") {
      maxPath = p;
      break;
    }
  }
  // read values (may be null if not found)
  const current = currentPath ? foundry.utils.getProperty(wrapper, currentPath) : null;
  const max = maxPath ? foundry.utils.getProperty(wrapper, maxPath) : null;
  return {
    current,
    max,
    nameCurrent: currentPath ?? "",
    nameMax: maxPath ?? "",
    hasCurrent: Boolean(currentPath),
    hasMax: Boolean(maxPath)
  };
}
//# sourceMappingURL=buildHp.js.map

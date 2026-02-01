export function getDataset(ev) {
    const el = ev.currentTarget;
    if (el instanceof HTMLElement)
        return el.dataset;
    return {};
}
//# sourceMappingURL=getDataset.js.map
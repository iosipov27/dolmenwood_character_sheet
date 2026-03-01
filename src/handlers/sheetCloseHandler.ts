export async function flushActiveFieldBeforeClose({
  form,
  getUpdateChain
}: {
  form: HTMLFormElement | null | undefined;
  getUpdateChain: () => Promise<void>;
}): Promise<void> {
  if (!(form instanceof HTMLFormElement)) return;

  const activeElement = form.ownerDocument?.activeElement;

  if (!(activeElement instanceof HTMLElement) || !form.contains(activeElement)) return;

  activeElement.blur();

  await Promise.resolve();
  await getUpdateChain().catch(() => {});
}

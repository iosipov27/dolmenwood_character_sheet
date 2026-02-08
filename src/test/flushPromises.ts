export async function flushPromises(times = 2): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await Promise.resolve();
  }
}

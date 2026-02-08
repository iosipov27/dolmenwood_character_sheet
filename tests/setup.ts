import $ from "jquery";

Object.assign(globalThis, { $, jQuery: $ });

function getProperty(object: unknown, path: string): unknown {
  if (!object || !path) return undefined;

  const parts = path.split(".");
  let current: unknown = object;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function setProperty(object: unknown, path: string, value: unknown): unknown {
  if (!object || !path || typeof object !== "object") return object;

  const parts = path.split(".");
  const last = parts.pop();

  if (!last) return object;

  let current = object as Record<string, unknown>;

  for (const part of parts) {
    const next = current[part];

    if (!next || typeof next !== "object") {
      current[part] = {};
    }

    current = current[part] as Record<string, unknown>;
  }

  current[last] = value;
  return object;
}

Object.assign(globalThis, {
  foundry: {
    utils: {
      duplicate: <T>(value: T): T => structuredClone(value),
      getProperty,
      setProperty
    }
  }
});

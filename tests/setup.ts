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

function expandObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    setProperty(result, key, value);
  }

  // Convert objects with numeric keys to arrays
  function convertToArrays(obj: unknown): unknown {
    if (obj == null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map(convertToArrays);
    }

    const record = obj as Record<string, unknown>;
    const keys = Object.keys(record);
    const isArrayLike = keys.every((key) => /^\d+$/.test(key));

    if (isArrayLike && keys.length > 0) {
      const arr: unknown[] = [];
      for (const key of keys) {
        arr[parseInt(key, 10)] = convertToArrays(record[key]);
      }
      return arr;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      result[key] = convertToArrays(value);
    }
    return result;
  }

  return convertToArrays(result) as Record<string, unknown>;
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

Object.assign(globalThis, {
  foundry: {
    utils: {
      duplicate: <T>(value: T): T => structuredClone(value),
      getProperty,
      setProperty,
      expandObject,
      flattenObject
    }
  }
});

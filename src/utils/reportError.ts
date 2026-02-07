import {
  ENABLE_DEBUG_LOGS_SETTING,
  ENABLE_ERROR_NOTIFICATIONS_SETTING
} from "../constants/settings.js";
import { MODULE_ID } from "../constants/moduleId.js";

type ModuleSettingKey =
  | typeof ENABLE_DEBUG_LOGS_SETTING
  | typeof ENABLE_ERROR_NOTIFICATIONS_SETTING;

function getBooleanSetting(key: ModuleSettingKey, fallback: boolean): boolean {
  const settings = game.settings;

  if (!settings) return fallback;

  try {
    return Boolean(settings.get(MODULE_ID, key));
  } catch {
    return fallback;
  }
}

export function reportError(message: string, error?: unknown): void {
  const wrappedError = error instanceof Error ? error : new Error(String(error ?? message));
  const shouldNotify = getBooleanSetting(ENABLE_ERROR_NOTIFICATIONS_SETTING, true);
  const shouldLog = getBooleanSetting(ENABLE_DEBUG_LOGS_SETTING, false);

  Hooks.onError(`${MODULE_ID}.reportError`, wrappedError, {
    msg: message,
    notify: shouldNotify ? "error" : null,
    log: shouldLog ? "error" : null
  });
}

import { MODULE_ID } from "../constants/moduleId.js";
import {
  ENABLE_DEBUG_LOGS_SETTING,
  ENABLE_ERROR_NOTIFICATIONS_SETTING
} from "../constants/settings.js";

export function registerSettings(): void {
  const settings = game.settings;

  if (!settings) return;

  settings.register(MODULE_ID, ENABLE_DEBUG_LOGS_SETTING, {
    name: "Enable debug logging",
    hint: "When enabled, module errors are written to the browser console.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });

  settings.register(MODULE_ID, ENABLE_ERROR_NOTIFICATIONS_SETTING, {
    name: "Enable error notifications",
    hint: "When enabled, module errors are shown as UI notifications.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
}
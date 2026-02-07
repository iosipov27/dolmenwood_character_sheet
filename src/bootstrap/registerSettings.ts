import { MODULE_ID } from "../constants/moduleId.js";
import {
  ENABLE_DEBUG_LOGS_SETTING,
  ENABLE_ERROR_NOTIFICATIONS_SETTING
} from "../constants/settings.js";

export function registerSettings(): void {
  const settings = game.settings;

  if (!settings) return;

  settings.register(MODULE_ID, ENABLE_DEBUG_LOGS_SETTING, {
    name: "DOLMENWOOD.Settings.EnableDebugLogsName",
    hint: "DOLMENWOOD.Settings.EnableDebugLogsHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });

  settings.register(MODULE_ID, ENABLE_ERROR_NOTIFICATIONS_SETTING, {
    name: "DOLMENWOOD.Settings.EnableErrorNotificationsName",
    hint: "DOLMENWOOD.Settings.EnableErrorNotificationsHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
}

import { MODULE_ID } from "./helper/const.js";

Hooks.on("init", () => {
  game.settings.register(MODULE_ID, "include-canvas.enabled", {
    name: game.i18n.localize(`${MODULE_ID}.module-settings.include-canvas.enabled.name`),
    hint: game.i18n.localize(`${MODULE_ID}.module-settings.include-canvas.enabled.hint`),
    scope: "world",
    config: true,
    default: false,
    type: boolean,
  });
});

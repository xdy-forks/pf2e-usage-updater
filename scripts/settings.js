import { MODULE_ID } from "./helper/const.js";

Hooks.on("init", () => {
  game.settings.register(MODULE_ID, "include-canvas.enabled", {
    name: game.i18n.localize(`${MODULE_ID}.module-settings.include-canvas.enabled.name`),
    hint: game.i18n.localize(`${MODULE_ID}.module-settings.include-canvas.enabled.hint`),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "automate-item.aeon-pearly-white", {
    name: game.i18n.localize(`${MODULE_ID}.module-settings.automate-item.aeon-pearly-white.name`),
    hint: game.i18n.localize(`${MODULE_ID}.module-settings.automate-item.aeon-pearly-white.hint`),
    scope: "world",
    config: true,
    default: "disabled",
    type: String,
    choices: {
      "disabled": game.i18n.localize(`${MODULE_ID}.module-settings.automate-item.aeon-pearly-white.choices.disabled`),
      "roll": game.i18n.localize(`${MODULE_ID}.module-settings.automate-item.aeon-pearly-white.choices.roll`),
      "auto": game.i18n.localize(`${MODULE_ID}.module-settings.automate-item.aeon-pearly-white.choices.auto`)
    },
  });
});

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

  game.settings.register(MODULE_ID, "inventory.icon.enabled", {
    name: game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.enabled.name`),
    hint: game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.enabled.hint`),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, "inventory.icon.gm-only", {
    name: game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.gm-only.name`),
    hint: game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.gm-only.hint`),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });
});

game.settings.register(MODULE_ID, "inventory.icon.style", {
  name: game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.name`),
  hint: game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.hint`),
  scope: "world",
  config: true,
  default: "symbols",
  type: String,
  choices: {
    "disabled": game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.choices.disabled`),
    "symbols": game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.choices.symbols`),
    "largest-full": game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.choices.largest-full`),
    "largest-short": game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.choices.largest-short`),
    "all-full": game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.choices.all-full`),
    "all-short": game.i18n.localize(`${MODULE_ID}.module-settings.inventory.icon.style.choices.all-short`),
  },
});

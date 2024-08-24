import { DAY, HOUR, MODULE_ID, MONTH, WEEK, YEAR } from "./helper/const.js";
import { combatRound, pf2eEndTurn, pf2eStartTurn, preCreateChatMessage, updateItem, updateWorldTime } from "./hooks.js";

Hooks.once("ready", function () {
  console.log("PF2E Uses Updater is Active");
  if (!game.user.isGM) return;
  Hooks.on("updateItem", updateItem);

  //Lowering Item use count if you don't have action support active
  Hooks.on("preCreateChatMessage", preCreateChatMessage);

  //Refreshing item usage count
  Hooks.on("updateWorldTime", updateWorldTime);

  Hooks.on("pf2e.endTurn", pf2eEndTurn);
  Hooks.on("pf2e.startTurn", pf2eStartTurn);
  Hooks.on("combatRound", combatRound);

  Hooks.on("combatStart", combatStart);
});

export function checkActionSupport() {
  const actionSupportLikeModuleIDS = [
    "pf2e-action-support",
    "pf2e-additional-automations",
  ];
  return !actionSupportLikeModuleIDS.some(
    (id) =>
      game.modules.get(id)?.active && game.settings.get(id, "decreaseFrequency")
  );
}

export async function updateFrequencyOfActors(
  party,
  total,
  diff,
  situation = "default"
) {
  for (const character of party) {
    await updateFrequency(character, total, diff, situation);
  }
}

export async function updateFrequency(character, total, diff, situation = "default") {
  const items = character.items.contents;
  const relevantItems = items.filter((it) =>
    isItemRelevant(it, total, diff, situation)
  );
  relevantItems.forEach((it) => {
    it.unsetFlag(MODULE_ID, "cooldown");
  });
  if (relevantItems.length > 0) {
    await character.updateEmbeddedDocuments(
      "Item",
      relevantItems.map((it) => ({
        _id: it.id,
        system: { frequency: { value: it.system.frequency.max } },
      }))
    );
  }
}

export function isItemRelevant(item, total, diff, situation) {
  if (!item?.getFlag(MODULE_ID, "cooldown")) updateItem(item, item, diff, null);
  const { cooldown } = item?.getFlag(MODULE_ID, "cooldown") || {};
  const isSpecialCase = checkAndHandleSpecialCase(item, total, diff, situation);
  if (!cooldown && !isSpecialCase) return false;
  switch (situation) {
    case "updateTime":
      return (
        item?.system?.frequency?.value < item?.system?.frequency?.max &&
        (cooldown <= total || ["turn", "round"].includes(cooldown))
      );
    case "startTurn":
    case "endTurn":
      return cooldown === "turn";
    case "startCombat":
    case "endRound":
      return ["turn", "round"].includes(cooldown);
    default:
      return (
        item?.system?.frequency?.value < item?.system?.frequency?.max &&
        cooldown <= total
      );
  }
}

export function getCoolDownTime(frequency) {
  const currentTime = game.time.worldTime;
  switch (frequency.per) {
    case "turn":
      return "turn";
    case "round":
      return "round";
    case "PT1M": // per 1 Minute
      return currentTime + 1;
    case "PT10M": // per 10 Minutes
      return currentTime + 10;
    case "PT1H": // per 1 hour
      return currentTime + HOUR;
    case "PT24H": // per 24 hours
      return currentTime + DAY;
    case "day": // per Day
      return "day"; //Note this is handled by the system
    case "PT1W": // per 1 Week
      return currentTime + WEEK;
    case "PT1M": // per 1 Month
      return currentTime + MONTH;
    case "PT1Y": // per 1 Year
      return currentTime + YEAR;
  }
}

export function getCombatActor() {
  game.combat.combatants.contents.map((com) => com.token.actor);
}

export async function checkAndHandleSpecialCase(item, _total, diff, _situation) {
  const slug = item.system.slug;
  const actor = item.actor;
  switch (slug) {
    case "aeon-stone-pearly-white-spindle":
      const mode = game.settings.get(MODULE_ID, "automate-item.aeon-pearly-white");
      if (mode !== 'disabled') {
        if (item.system.usage.value !== "worn") {
          break;
        }
        const health = Math.min(
          Math.floor(diff / 60),
          actor.system.attributes.hp.max - actor.system.attributes.hp.value
        );
        if (health > 0) {
          if (mode === 'roll') {
            const DamageRoll = CONFIG.Dice.rolls.find(
              (r) => r.name === "DamageRoll"
            );
            new DamageRoll(`{${health}}[Healing]`).toMessage({
              flavor: item.name,
              speaker: ChatMessage.getSpeaker({ actor }),
            });
          } else if (mode === 'auto') {
            await actor.update({ "system.attributes.hp.value": health })
            await ChatMessage.create({ content: `@UUID[Compendium.pf2e.equipment-srd.Item.4A8SFipG78SMWQEU] healed <b>${actor.name}</b> for ${health}` })
          }
        }
      }
      break;
    default:
      break;
  }
  return false;
}

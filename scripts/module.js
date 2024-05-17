import { DAY, HOUR, MODULE_ID, MONTH, WEEK, YEAR } from "./helper/const.js";
Hooks.once("ready", function () {
  console.log("PF2E Uses Updater is Active");
  if (!game.user.isGM) return;
  Hooks.on("updateItem", async (item, changes, diff, userID) => {
    //Use this to set item flags
    //Ignore day (as that is handled by the system)
    const usesChange = changes?.system?.frequency?.value;
    const maxUses = item?.system?.frequency?.max;
    if (usesChange < maxUses) {
      // change is a frequency change, and it's lower than max
      const flag = item.getFlag(MODULE_ID, "cooldown");
      if (!flag || flag.per !== item?.system?.frequency?.per) {
        const cooldown = getCoolDownTime(item?.system?.frequency);
        if (cooldown) {
          item.setFlag(MODULE_ID, "cooldown", {
            cooldown,
            per: item?.system?.frequency?.per,
          });
        }
      }
    }
  });

  //Lowering Item use count if you don't have action support active
  Hooks.on("preCreateChatMessage", async (msg, _data, _info, _userID) => {
    if (checkActionSupport()) {
      const item = msg.item;
      if (item?.system?.frequency?.value) {
        await item.update({
          system: { frequency: { value: item.system.frequency.value - 1 } },
        });
      }
    }
  });

  //Refreshing item usage count
  Hooks.on("updateWorldTime", async (total, diff) => {
    const actors = game.actors.party.members;
    if (game.settings.get(MODULE_ID, "include-canvas.enabled")) {
      actors.push(...(canvas?.tokens?.placeables?.map((t) => t?.actor) ?? []));
    }
    await updateFrequencyOfActors(
      actors,
      total,
      diff,
      !game.combat ? "updateTime" : "default"
    );
  });

  Hooks.on("pf2e.endTurn", async (combatant, _encounter, _userID) => {
    updateFrequency(combatant.token.actor, 0, "endTurn");
  });
  Hooks.on("pf2e.startTurn", async (combatant, _encounter, _userID) => {
    updateFrequency(combatant.token.actor, 0, "startTurn");
  });
  Hooks.on("combatRound", async (_encounter, _changes, _diff, _userID) => {
    const actors = game.combat.combatants.contents.map(
      (combatant) => combatant.token.actor
    );
    updateFrequencyOfActors(actors, 0, "endRound");
  });
});

function checkActionSupport() {
  const actionSupportLikeModuleIDS = [
    "pf2e-action-support",
    "pf2e-additional-automations",
  ];
  return !actionSupportLikeModuleIDS.some(
    (id) =>
      game.modules.get(id)?.active && game.settings.get(id, "decreaseFrequency")
  );
}

async function updateFrequencyOfActors(
  party,
  total,
  diff,
  situation = "default"
) {
  for (const character of party) {
    await updateFrequency(character, total, diff, situation);
  }
}

async function updateFrequency(character, total, diff, situation = "default") {
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
    case "endRound":
      return cooldown === "round" || cooldown === "turn";
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
  [...game.combat.combatants.values()].map((com) => com.token.actor);
}

export function checkAndHandleSpecialCase(item, _total, diff, _situation) {
  const slug = item.system.slug;
  const actor = item.actor;
  switch (slug) {
    case "aeon-stone-pearly-white-spindle":
      game.settings.get(MODULE_ID, "automate-item.aeon-pearly-white");
      const health = Math.min(
        Math.floor(diff / 60),
        actor.system.attributes.hp.max - actor.system.attributes.hp.value
      );
      if (health > 0) {
        const DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll");
        new DamageRoll(`{${health}}[Healing]`).toMessage({
          flavor: item.name,
          speaker: ChatMessage.getSpeaker(),
        });
      }
      break;
    default:
      break;
  }
  return false;
}

import { DAY, HOUR, MODULE_ID, MONTH, WEEK, YEAR } from "./helper/const.js";
Hooks.once("ready", async function () {
  console.log("PF2E Uses Updater is Active");
  if (!game.user.isGM) return;
  Hooks.on("updateItem", async (item, changes, diff, userID) => {
    //Use this to set item flags
    //Ignore day (as that is handled by the system)
    const usesChange = changes?.system?.frequency?.value;
    const maxUses = item?.system?.frequency?.max;
    if (usesChange && maxUses < usesChange) {
      // change is a frequency change, and it's lower than max
      if (!item.getFlag(MODULE_ID, "cooldown")) {
        const cooldown = getCoolDownTime(item?.system?.frequency);
        if (cooldown) {
          item.setFlag(MODULE_ID, "cooldown", cooldown);
        }
      }
    }
  });

  //Lowering Item use count if you don't have action support active
  Hooks.on("preCreateChatMessage", async (msg, _data, _info, _userID) => {
    if (
      !(
        game.modules.get("pf2e-action-support")?.active &&
        game.settings.get("pf2e-action-support", "decreaseFrequency")
      )
    ) {
      const item = msg.item;
      if (item?.system?.frequency?.value) {
        await item.update({
          system: { frequency: { value: it.system.frequency.value - 1 } },
        });
      }
    }
  });

  //Refreshing item usage count
  Hooks.on("updateWorldTime", async (total, _diff) => {
    const party = game.actors.party.members;
    await updateFrequencyOfActors(
      party,
      total,
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

async function updateFrequencyOfActors(party, total, situation = "default") {
  for (const character of party) {
    await updateFrequency(character, total, situation);
  }
}

async function updateFrequency(character, total, situation = "default") {
  const items = character.items.contents;
  const relevantItems = items.filter((it) =>
    isItemRelevant(it, total, situation)
  );
  relevantItems.forEach((it) => {
    it.unsetFlag(MODULE_ID, "cooldown");
  });
  if (relevantItems.length > 0) {
    await character.updateEmbeddedDocuments(
      "item",
      relevantItems.map((it) => ({
        _id: it.id,
        system: { frequency: { value: it.system.frequency.max } },
      }))
    );
  }
}

export function isItemRelevant(item, total, situation) {
  const cooldown = item.getFlag(MODULE_ID, "cooldown");
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
        item.getFlag(MODULE_ID, "cooldown") <= total
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

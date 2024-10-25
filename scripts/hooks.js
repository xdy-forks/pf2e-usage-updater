import { MODULE_ID } from "./helper/const.js";
import { checkActionSupport, getCoolDownTime, updateFrequency, updateFrequencyOfActors } from "./module.js";

export async function updateItem(item, changes, _diff, _userID) {
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
}

export async function updateWorldTime(total, diff) {
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
}

// export async function pf2eEndTurn(combatant, _encounter, _userID) {
//     await updateFrequency(combatant.token.actor, 0, {}, "endTurn");
// }

export async function combatRound(encounter, _changes, _diff, _userID) {
    const actors = encounter.combatants.contents.map(
        (combatant) => combatant.token.actor
    );
    await updateFrequencyOfActors(actors, 0, _diff, "endRound");
}
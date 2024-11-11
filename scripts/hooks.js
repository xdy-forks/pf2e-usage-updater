import { MODULE_ID } from "./helper/const.js";
import { getCanvasActors } from "./lib/helpers.js";
import { getCoolDownTime, updateFrequencyOfActors } from "./module.js";
import { showCooldownsOnSheet } from "./styling.js";

/**
 * Updates an item's cooldown flag based on frequency changes.
 * 
 * @param {Object} item - The item to be updated.
 * @param {Object} changes - The changes being applied to the item.
 * @param {*} _diff - Unused parameter (possibly for future use).
 * @param {*} _userID - Unused parameter (possibly for future use).
 */
export async function updateItem(item, changes, _diff, _userID) {
    const usesChange = changes?.system?.frequency?.value;
    const maxUses = item?.system?.frequency?.max;

    // If uses are less than max, update or set cooldown flag
    if (usesChange < maxUses) {
        updateCooldownFlag(item);
    }
    // If uses are at or above max, remove cooldown flag
    else if (usesChange && usesChange >= maxUses) {
        item.unsetFlag(MODULE_ID, "cooldown");
    }
}

/**
 * Updates the cooldown flag for an item.
 * 
 * @param {Object} item - The item to update the cooldown flag for.
 */
function updateCooldownFlag(item) {
    const currentFlag = item.getFlag(MODULE_ID, "cooldown");
    const frequencyPer = item?.system?.frequency?.per;

    const shouldUpdateFlag = !currentFlag ||
        currentFlag.per !== frequencyPer ||
        (currentFlag.hasOwnProperty('cooldown') && !currentFlag?.cooldown) ||
        !currentFlag.hasOwnProperty('version');

    if (shouldUpdateFlag) {
        const cooldown = getCoolDownTime(item?.system?.frequency);
        if (cooldown) {
            item.setFlag(MODULE_ID, "cooldown", {
                cooldown,
                per: frequencyPer,
                version: game.modules?.get(MODULE_ID)?.version
            });
        }
    }
}

/**
 * Updates the world time and refreshes frequency-based abilities for actors.
 * 
 * @param {number} total - The total amount of time passed.
 * @param {number} diff - The difference in time since the last update.
 */
export async function updateWorldTime(total, diff) {
    // Get party members
    let actors = game.actors.party.members;

    // Include canvas tokens if the setting is enabled
    if (game.settings.get(MODULE_ID, "include-canvas.enabled")) {
        const canvasActors = getCanvasActors();
        actors = actors.concat(canvasActors);
    }

    // Determine the update type based on combat status
    const updateType = game.combat ? "default" : "updateTime";

    // Update frequency-based abilities for all relevant actors
    await updateFrequencyOfActors(actors, total, diff, updateType);
}

export async function combatRound(encounter, _changes, _diff, _userID) {
    const actors = encounter.combatants.contents.map(
        (combatant) => combatant.token.actor
    );
    await updateFrequencyOfActors(actors, 0, _diff, "endRound");
}

Hooks.on("renderCharacterSheetPF2e", (_sheet, html, character) => {
    if (game.settings.get(MODULE_ID, "inventory.icon.enabled") && !(game.settings.get(MODULE_ID, "inventory.icon.gm-only") && !game.user.isGM)) {
        const a = _sheet.actor;
        if (character.owner) {
            const actionsList = html.find(
                ".sheet-body .actions-container .actions-panels"
            );

            showCooldownsOnSheet(actionsList, a);
        }
    }
})
import { MODULE_ID } from "./helper/const.js";
import { getCoolDownTime, updateFrequencyOfActors } from "./module.js";

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

Hooks.on("renderCharacterSheetPF2e", (_sheet, html, character) => {
    const a = _sheet.actor;
    if (character.owner) {
        const inventoryList = html.find(
            ".sheet-body .inventory-list.directory-list.inventory-pane"
        );

        showCooldownsOnSheet(inventoryList, a);

    }
})

function showCooldownsOnSheet(inventoryList, a) {
    const items = a?.items?.contents.filter(i => {
        const cd = i.getFlag("pf2e-usage-updater", "cooldown");
        return !!cd && !["round", "turn"].includes(cd?.per)
    })
    const currentTime = game.time.worldTime;
    if (items) {
        for (const item of items) {
            const id = item.id;
            const cooldown = item.getFlag("pf2e-usage-updater", "cooldown")?.cooldown;
            const timeRemainingInSeconds = cooldown - currentTime;
            const timeFormat = formatTime(timeRemainingInSeconds);
            const inventoryItem = $(inventoryList).find($("li")).filter($(id));

            $(inventoryItem)
                .find("div.item-name")
                .append(
                    $(
                        `s<i class="fas fa-hourglass-start" data-tooltip="${timeFormat}"></i>`
                    )
                );
        }
    }
}

function formatTime(seconds, format = 1, icons = {
    days: 'fa-calendar-day',
    hours: 'fa-clock',
    minutes: 'fa-hourglass-half',
    seconds: 'fa-stopwatch'
}) {
    const units = [
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
        { name: 'second', seconds: 1 }
    ];

    let result = [];
    let largestUnit = null;

    for (let unit of units) {
        const count = Math.floor(seconds / unit.seconds);
        if (count > 0 || result.length > 0) {
            result.push({ name: unit.name, count: count });
            seconds %= unit.seconds;
            if (!largestUnit) largestUnit = { name: unit.name, count: count };
        }
    }

    switch (format) {
        case 1:
            return result.map(r => `${r.count} ${r.name.charAt(0)}`).join(' ');
        case 2:
            return `${largestUnit.count} ${largestUnit.name.charAt(0)}`;
        case 3:
            return result.map(r => `${r.count} ${r.name}${r.count !== 1 ? 's' : ''}`).join(' ');
        case 4:
            return `${largestUnit.count} ${largestUnit.name}${largestUnit.count !== 1 ? 's' : ''}`;
        case 5:
            let iconOutput = '';
            for (let unit of units) {
                const count = Math.floor(seconds / unit.seconds);
                if (count > 0) {
                    iconOutput += `<i class="fas ${icons[unit.name + 's']}"></i>`.repeat(count);
                    seconds %= unit.seconds;
                }
            }
            return iconOutput;
        default:
            return 'Invalid format';
    }
}
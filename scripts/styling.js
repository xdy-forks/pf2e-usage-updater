import { DAY, HOUR, MINUTE, MODULE_ID } from "./helper/const.js";

export function showCooldownsOnSheet(actionsList, a) {
    const items = a?.items?.contents.filter(i => {
        const cd = i.getFlag(MODULE_ID, "cooldown");
        return !!cd && !["round", "turn"].includes(cd?.per)
    })
    const currentTime = game.time.worldTime;
    if (items) {
        const format = game.settings.get(MODULE_ID, "inventory.icon.style");
        for (const item of items) {
            const id = `[data-item-id="${item.id}"]`;
            const cooldown = item.getFlag(MODULE_ID, "cooldown")?.cooldown;
            const timeRemainingInSeconds = cooldown - currentTime;
            const timeFormat = formatTime(timeRemainingInSeconds, format);
            const actionItem = $(actionsList).find($("li")).filter($(id));

            $(actionItem)
                .find("h4.name")
                .append(
                    $(
                        `<i class="fas fa-hourglass-start" data-tooltip-direction="UP" data-tooltip="${timeFormat}"></i>`
                    )
                );
        }
    }
}
const icons = {
    days: 'fa-calendar-day',
    hours: 'fa-clock',
    minutes: 'fa-hourglass-half',
    turns: 'fa-stopwatch',
    seconds: 'fa-stopwatch'
}

function formatTime(seconds, format = 'symbols') {
    const units = [
        { name: 'day', seconds: DAY },
        { name: 'hour', seconds: HOUR },
        { name: 'minute', seconds: MINUTE },
        { name: 'turn', seconds: 6 }
    ];

    let result = [];
    let largestUnit = null;

    for (let unit of units) {
        const count = Math.floor(seconds / unit.seconds);
        if (count > 0 || result.length > 0) {
            result.push({ name: unit.name, count: count, remainder: count % unit.seconds });
            seconds %= unit.seconds;
            if (!largestUnit) largestUnit = { name: unit.name, count: count, remainder: seconds % unit.seconds };
        }
    }

    switch (format) {
        case 'disabled':
            return '';
        case 'all-short':
            return result.map(r => `${r.count}${r.name.charAt(0)}`).join(' ');
        case 'largest-short':
            return `${largestUnit.remainder > 0 ? '< ' : ""}${largestUnit.remainder > 0 ? largestUnit.count + 1 : largestUnit.count} ${largestUnit.name.charAt(0)}`;
        case 'all-full':
            return result.map(r => `${r.count} ${r.name}${r.count !== 1 ? 's' : ''}`).join(' ');
        case 'largest-full':
            return `${largestUnit.remainder > 0 ? '< ' : ""}${largestUnit.remainder > 0 ? largestUnit.count + 1 : largestUnit.count} ${largestUnit.name}${largestUnit.count !== 1 ? 's' : ''}`;
        case 'symbols':
            let iconOutput = '';
            if (largestUnit.count > 0) {
                if (largestUnit.remainder > 0) {
                    iconOutput += `<i class='far ${icons[largestUnit.name + 's']}'></i>`;
                }
                iconOutput += `<i class='fas ${icons[largestUnit.name + 's']}'></i>`.repeat(largestUnit.count);
            }
            return iconOutput;
        default:
            return 'Invalid format';
    }
}
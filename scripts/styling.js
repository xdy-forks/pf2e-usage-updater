import { DAY, HOUR, MINUTE } from "./helper/const.js";

export function showCooldownsOnSheet(actionsList, a) {
    const items = a?.items?.contents.filter(i => {
        const cd = i.getFlag("pf2e-usage-updater", "cooldown");
        return !!cd && !["round", "turn"].includes(cd?.per)
    })
    const currentTime = game.time.worldTime;
    if (items) {
        for (const item of items) {
            const id = `[data-item-id="${item.id}"]`;
            const cooldown = item.getFlag("pf2e-usage-updater", "cooldown")?.cooldown;
            const timeRemainingInSeconds = cooldown - currentTime;
            const timeFormat = formatTime(timeRemainingInSeconds);
            const actionItem = $(actionsList).find($("li")).filter($(id));

            $(actionItem)
                .find("h4.name")
                .append(
                    $(
                        `<i class="fas fa-hourglass-start" data-tooltip="${timeFormat}"></i>`
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
        { name: 'day', seconds: DAY },
        { name: 'hour', seconds: HOUR },
        { name: 'minute', seconds: MINUTE },
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
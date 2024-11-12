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
            const timeRemainingInSeconds = (typeof cooldown === 'string') ? cooldown : cooldown - currentTime;
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
    day: {
        full: 'fas fa-calendar-day',
        half: 'fad fa-calendar-day'
    },
    hour: {
        full: 'fas fa-clock',
        half: 'far fa-clock'
    },
    minute: {
        full: 'fas fa-hourglass-half',
        half: 'fad fa-hourglass-end'
    },
    turn: {
        full: 'fas fa-stopwatch',
        half: 'far fa-stopwatch'
    },
    second: {
        full: 'fad fa-stopwatch',
        half: ''
    }
}

function formatTime(seconds, format = 'symbols') {
    const units = [
        { name: 'day', seconds: DAY },
        { name: 'hour', seconds: HOUR },
        { name: 'minute', seconds: MINUTE },
        { name: 'turn', seconds: 6 },
    ];

    let result = [];
    let largestUnit = { name: "day", count: 0, remainder: 0 }; //Default Value
    if (typeof seconds === 'string') {
        switch (seconds) {
            case 'day':
                largestUnit = { name: "day", count: 1, remainder: 0 };
                break;
            case 'turn':
            case 'round':
                largestUnit = { name: "turn", count: 1, remainder: 0 };
                break;

        }
        result.push(largestUnit);
    } else {
        for (let unit of units) {
            const count = Math.floor(seconds / unit.seconds);
            if (count > 0) {
                result.push({ name: unit.name, count: count, remainder: seconds % unit.seconds });
                if (!largestUnit) largestUnit = { name: unit.name, count: count, remainder: seconds % unit.seconds };
                seconds %= unit.seconds;
            }
        }
    }

    switch (format) {
        case 'disabled':
            return '';
        case 'all-short':
            return result.map(r => `${r.count}${r.name.charAt(0)}`).join(' ');
        case 'largest-short':
            return `${largestUnit?.remainder > 0 ? '< ' : ""}${largestUnit?.remainder > 0 ? largestUnit?.count + 1 : largestUnit?.count} ${largestUnit?.name.charAt(0)}`;
        case 'all-full':
            return result.map(r => `${r.count} ${r.name}${r.count !== 1 ? 's' : ''}`).join(' ');
        case 'largest-full':
            return `${largestUnit.remainder > 0 ? '< ' : ""}${largestUnit.remainder > 0 ? largestUnit.count + 1 : largestUnit.count} ${largestUnit.name}${largestUnit.count !== 1 ? 's' : ''}`;
        case 'symbols':
            let iconOutput = '';
            if (largestUnit.count > 0) {
                iconOutput += `<i class='${icons[largestUnit.name].full}'></i> `.repeat(largestUnit?.count ?? 0);
                if (largestUnit.remainder > 0) {
                    iconOutput += `<i class='${icons[largestUnit.name].half}'></i>`;
                }
            }
            return iconOutput;
        default:
            return 'Invalid format';
    }
}

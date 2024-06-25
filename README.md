![](https://img.shields.io/badge/Foundry-v12-informational)
![All Downloads](https://img.shields.io/github/downloads/ChasarooniZ/pf2e-usage-updater/total?color=5e0000&label=All%20Downloads)
![Latest Release Download Count](https://img.shields.io/github/downloads/ChasarooniZ/pf2e-usage-updater/latest/module.zip)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpf2e-item-activations&colorB=4aa94a)


![module_banner](https://github.com/ChasarooniZ/pf2e-usage-updater/assets/79132112/3b2a4f8c-7ba1-4647-b073-d8ecac9d93a6)

# PF2e Usage Updater
This simple module exists to update item uses of the party, and of combatants.

## Features
- **Decrease Action uses when sent to chat**
    - When you send an action like Orc Ferocity etc. to Chat will automatically reduce the uses
- **Refresh Party actions on Time Update**
  - When time is progressed will track and refresh the party's actions when enough (world time) has passed for them to be up again
  - **Limitation** The cooldown for refresh starts whenever you first reduce your action's use count so take that as you will
  - **Note** - Actions with a cooldown of `Day` refresh on taking `Rest for the Night` (is a base pf2e feature)
- **Refresh Combatants Actions in Combat**
  - For actions with a `per turn` or `per round` use count this refreshes those

## Compatibility
- [Pf2e Action Support](https://github.com/reyzor1991/foundry-vtt-pf2e-action-support) - Automatically detects if you have this module active, and its decrease frequency feature and will disable this module's decrease frequency feature

## 7
- Fixed Aeon Stone (Pearly White Spindle) automation
## 2.0.0 - V12 Support
- Added Support for Fvtt `v12`
## 1.0.0 - Full Release
- Fixed error messages for items that don't have usage
- Added option to automate Aeon Stone (Pearly White Spindle) to settings
## 0.9.5 - Fixed Localization
- Fixed localization name to be correct
## 0.9.4 - More Bug Fixes Latest
- Catches scenarios where items don't have flags
## 0.9.3 - Oh what a difference capitalization can make
- Fixed issue with settings not populating (@Ghost_desu)
## 0.9.2 - Features + Bugfixes
- Added detection for if your frequency changes so that, it won't be stuck to the old cooldown
- Added setting to allow you to toggle time based refresh for all tokens on current canvas
  - _Note: If you have a lot of tokens, may have performance implications_

_Shout out to @Rigo for a lot of early bug testing_
## 0.9.1 - Usage Fixes + Extra Module support
- Added Support for `pf2e-additional-automations` (@Mecha Maya)
- Fix bug with usage not ticking down action count
## 0.9.0 - Initial Release
- This simple module exists to update item uses of the party, and of combatants.
- **Features**
  - **Decrease Action uses when sent to chat**
      - When you send an action like Orc Ferocity etc. to Chat will automatically reduce the uses
  - **Refresh Party actions on Time Update**
    - When time is progressed will track and refresh the party's actions when enough (world time) has passed for them to be up again
    - **Limitation** The cooldown for refresh starts whenever you first reduce your action's use count so take that as you will
    - **Note** - Actions with a cooldown of `Day` refresh on taking `Rest for the Night` (is a base pf2e feature)
  - **Refresh Combatants Actions in Combat**
    - For actions with a `per turn` or `per round` use count this refreshes those
- **Compatibility**
  - [Pf2e Action Support](https://github.com/reyzor1991/foundry-vtt-pf2e-action-support) - Automatically detects if you have this module active, and its decrease frequency feature and will disable this module's decrease frequency feature

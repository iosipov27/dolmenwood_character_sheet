# Dolmenwood Character Sheet (for OSE)

A custom Foundry VTT character sheet for **Dolmenwood**, built on top of the **OSE** actor data model.

The sheet keeps OSE system data where it belongs and stores Dolmenwood-specific fields in:

`actor.flags["yakov-dolmenwood-sheet"].dw`

## Requirements

- Foundry VTT `13+`
- OSE system `2.1.0+`

## Sheet Overview

The character sheet is organized into four tabs:

- `Main`
- `Equipment`
- `Spells & Traits`
- `Details`

The layout is focused on quick table use: fast editing, built-in rolls, compendium drag and drop, and Dolmenwood-specific fields without replacing the underlying OSE actor structure.

## Main Features

### Main Tab

The `Main` tab covers the core day-to-day character workflow:

- Character identity fields: `Name`, `Kindred & Class`, `Background`, `Alignment`
- Optional character details that can be shown or hidden:
  - `Affiliation`
  - `Moon Sign`
- Clickable avatar block
- Ability scores in Dolmenwood order:
  - `STR`, `INT`, `WIS`, `DEX`, `CON`, `CHA`
- Hit Points, Saving Throws, Armor Class, Attack, and Movement
- Melee and missile attack buttons include automatic ability-based modifiers plus an optional extra bonus set by the player, for example class-based attack modifiers
- Built-in Skill Targets with support for up to 10 extra custom skills
- Inline rolls directly from the sheet to chat

### Equipment Tab

The `Equipment` tab is designed for both manual entry and compendium-assisted load tracking:

- `Tiny Items` text area
- Separate `Equipped Items` and `Stowed Items` lists
- Per-slot editable weight fields
- Automatic total carried weight display
- Live `Encumbrance` meter based on item weight and coins
- Drag and drop from compendiums directly into equipment slots
- Mixed slot support:
  - plain text entries
  - compendium-backed items
- Compendium-backed equipment can:
  - keep a custom editable weight
  - be removed back to an empty slot
  - be opened directly from the sheet
- Equipment accepts compendium item types except `spell` and `ability`

### Spells & Traits Tab

The `Spells & Traits` tab combines compendium content with editable class notes:

- Drag and drop `spell` items from compendiums into the Spells section
- Drag and drop `ability` items from compendiums into the Traits section
- Open item sheets directly from the character sheet
- Remove items with native Foundry confirmation dialogs
- View switcher:
  - `Cards`
  - `Text`
  - `Both`
- Collapsible `Spells` and `Traits` sections
- Per-actor persistence of collapsed state
- `Kindred & Class Traits` rich text editor

### Details Tab

The `Details` tab groups the longer-form and bookkeeping fields:

- `Languages`
- `Other Notes`
- Coin tracking:
  - `Copper`
  - `Silver`
  - `Gold`
  - `Pellucidium`
- XP summary block:
  - `XP`
  - `Level`
  - `Next Level`
  - `Modifier`

## Built-in Rolls

The sheet includes clickable rolls for the most common character actions:

- **Ability checks**
  - `1d6 +/- modifier`
  - success on `>= 4`
  - natural `1` is auto-fail, natural `6` is auto-success
- **Skill checks**
  - `1d6`
  - success on `>= target`
  - natural `1` is auto-fail, natural `6` is auto-success
- **Saving throws**
  - `1d20` against the target value
- **Attack rolls**
  - melee uses `STR`
  - ranged uses `DEX`
  - supports inline attack bonuses from the sheet
  - natural `1` is auto-fail, natural `20` is auto-success

## Compendium Integration

The sheet supports direct compendium workflows in two places:

- `Spells & Traits`
  - `spell` items in Spells
  - `ability` items in Traits
- `Equipment`
  - compendium item types other than `spell` and `ability`

Compendium-backed entries remain usable from the sheet itself:

- open the item sheet
- keep the linked title visible
- remove the entry when needed

## UX Notes

- The sheet uses the OSE actor as the source of truth for system data
- Dolmenwood-specific content is stored in module flags
- Empty-state hints are shown in sections that support drag and drop
- Existing Foundry dialogs are reused for confirmation flows
- The layout is optimized for quick use at the table rather than deep nested navigation

## Screenshot

![Dolmenwood Fighter Sheet](docs/dolmenwood_charsheet_attack.png)

## Publishing

1. Bump `version` in `module.json`.
2. Build and package release assets:

```bash
npm run release:local
```

This creates:

- `dist/module.json`
- `dist/dolmenwood.zip`
- `dist/yakov-dolmenwood-sheet-v<version>.zip`

3. Create a GitHub release/tag such as `v1.0.0`.
4. Upload `dist/module.json` and `dist/dolmenwood.zip` as release assets.

Foundry manifest URL:

`https://github.com/iosipov27/dolmenwood_character_sheet/releases/latest/download/module.json`

## Optional GitHub Release Workflow

A workflow is included at `.github/workflows/release.yml`.

If you push a tag like `v1.0.0`, GitHub Actions can publish:

- `dist/module.json`
- `dist/dolmenwood.zip`

## Project Board

- https://github.com/users/iosipov27/projects/1

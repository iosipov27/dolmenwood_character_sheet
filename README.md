# Dolmenwood Character Sheet (for OSE)

A custom character sheet module for Foundry VTT, designed for Dolmenwood and built on top of OSE character sheet data.

## Requirements

- Foundry VTT `13+` (in `module.json`: `minimum: 13`, `verified: 13`)
- OSE system installed (the module detects and uses the OSE character sheet class as its base)

## Overview

- Three-tab sheet layout: `Main`, `Equipment`, `Details`
- Uses OSE actor system data (HP, AC, attack, movement, abilities, etc.)
- Stores Dolmenwood-specific fields in `actor.flags.dolmenwood.dw`
- Clickable rolls directly from the sheet to chat

## Screenshot

![Dolmenwood Fighter Sheet](docs/fighter.png)

## Core Features

- Ability checks: `1d6 +/- modifier`, success on `>= 4`, natural `1/6` are auto-fail/auto-success
- Skill checks: `1d6`, success on `>= skill value`, natural `1/6` are auto-fail/auto-success
- Save checks: `1d20` against target value
- Attack rolls: `1d20 + modifier` (STR for melee, DEX for ranged)
- Extra skills: add/remove up to 10 custom skill entries
- Equipment management:
  - equipped and stowed item lists
  - per-item weight fields
  - automatic total encumbrance calculation
- Editable text blocks: `Kindred & Class Traits`, `Languages`, `Other Notes`
- Coins block: `copper`, `silver`, `gold`, `pellucidium`

## Default Values

- Base skills: `6`
- New extra skill target: `6`
- Coins: `0`

## Usage

The module registers a custom sheet for `character` actors, but does not set it as default (`makeDefault: false`).
Select it manually in the actor sheet configuration.

## Module Settings

- `Enable debug logging`
- `Enable error notifications`

## Roadmap

- Planned: move away from inheriting the OSE sheet module and make this character sheet fully independent.

## Development

```bash
npm install
npm run build
npm test
```

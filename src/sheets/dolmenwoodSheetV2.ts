import { MODULE_ID } from "../constants/moduleId.js";
import {
  DW_ADD_SKILL,
  DW_DELETE_ITEM,
  DW_OPEN_ITEM,
  DW_REMOVE_SKILL,
  DW_ROLL_ABILITY,
  DW_ROLL_ATTACK,
  DW_ROLL_EXTRA_SKILL,
  DW_ROLL_SAVE,
  DW_ROLL_SKILL,
  DW_SET_SPELLS_TRAITS_VIEW,
  DW_TOGGLE_COLLAPSIBLE_SECTION
} from "../constants/templateAttributes.js";
import { FormDataHandler } from "../handlers/formDataHandler.js";
import { registerAttackDamageRollChatListener } from "../listeners/registerAttackDamageRollChatListener.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import { RollChecks } from "./rollChecks.js";
import { prettyKey } from "../utils/prettyKey.js";
import { buildAbilities } from "../utils/buildAbilities.js";
import type { BaseSheetData, DwExtraSkill, HtmlRoot } from "../types.js";
import { reportError } from "../utils/reportError.js";
import { SpellsAbilitiesDropHandler } from "../utils/spellsAbilitiesDropHandler.js";
import { registerEquipmentListener } from "../components/equipment/equipment.listener.js";

const TAB_GROUP = "dolmenwood-sheet-tabs";
const TAB_IDS = ["main", "equipment", "spells-abilities", "details"] as const;
const VIEW_MODES = ["cards", "text", "both"] as const;
const TOGGLE_VIEW_MODES = ["cards", "text"] as const;
const VIEW_CLASS_PREFIX = "dw-spells-abilities--view-";
const VIEW_CLASSES = VIEW_MODES.map((mode) => `${VIEW_CLASS_PREFIX}${mode}`).join(" ");
const CARDS_COLLAPSED_LAYOUT_CLASS = "dw-spells-abilities--cards-collapsed";
const SPELLS_COLLAPSED_LAYOUT_CLASS = "dw-spells-abilities--spells-collapsed";
const TRAITS_COLLAPSED_LAYOUT_CLASS = "dw-spells-abilities--traits-collapsed";
const CARDS_ROW_HEIGHT_CSS_VAR = "--dw-cards-row-height";

const ATTACK_TO_ABILITY: Record<string, "str" | "dex"> = {
  melee: "str",
  ranged: "dex"
};
const ATTACK_TO_BONUS_PATH: Record<string, string> = {
  melee: "meta.meleeAttackBonus",
  ranged: "meta.missileAttackBonus"
};
const ATTACK_TO_BONUS_INPUT: Record<string, string> = {
  melee: "dw.meta.meleeAttackBonus",
  ranged: "dw.meta.missileAttackBonus"
};
const ATTACK_TO_DAMAGE_PATH: Record<string, string> = {
  melee: "meta.meleeDamageFormula",
  ranged: "meta.missileDamageFormula"
};
const ATTACK_TO_DAMAGE_INPUT: Record<string, string> = {
  melee: "dw.meta.meleeDamageFormula",
  ranged: "dw.meta.missileDamageFormula"
};

declare abstract class BaseV2SheetClass {
  actor: Actor.Implementation;
  form: HTMLFormElement | null;
  element: HTMLElement | null;
  isEditable: boolean;
  submit(submitOptions?: Record<string, unknown>): Promise<void>;

  protected _prepareContext(
    options: Record<string, unknown> & { isFirstRender: boolean }
  ): Promise<Record<string, unknown>>;
  protected _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: Record<string, unknown>
  ): void;
  protected _processSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: foundry.applications.ux.FormDataExtended,
    options?: unknown
  ): Promise<void>;
  protected _preClose(options: Record<string, unknown>): Promise<void>;
  protected _onDropItem(event: DragEvent, item: Item.Implementation): Promise<Item.Implementation | null>;
}

type BaseV2SheetConstructor = abstract new (...args: unknown[]) => BaseV2SheetClass;

const BaseV2Sheet = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) as unknown as BaseV2SheetConstructor;

export class DolmenwoodSheetV2 extends BaseV2Sheet {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-v2`,
    classes: ["dolmenwood", "sheet", "actor"],
    position: {
      width: 640,
      height: 730
    },
    window: {
      resizable: true
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      [DW_ROLL_SAVE]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleRollSave(target);
      },
      [DW_ROLL_SKILL]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleRollSkill(target);
      },
      [DW_ROLL_ABILITY]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleRollAbility(target);
      },
      [DW_ROLL_ATTACK]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleRollAttack(target);
      },
      [DW_ROLL_EXTRA_SKILL]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleRollExtraSkill(target);
      },
      [DW_ADD_SKILL]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent
      ): Promise<void> {
        event.preventDefault();
        await this.handleAddSkill();
      },
      [DW_REMOVE_SKILL]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleRemoveSkill(target);
      },
      [DW_OPEN_ITEM]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleOpenItem(target);
      },
      [DW_DELETE_ITEM]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleDeleteItem(target);
      },
      [DW_SET_SPELLS_TRAITS_VIEW]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleSetSpellsTraitsView(target);
      },
      [DW_TOGGLE_COLLAPSIBLE_SECTION]: async function (
        this: DolmenwoodSheetV2,
        event: PointerEvent,
        target: HTMLElement
      ): Promise<void> {
        event.preventDefault();
        await this.handleToggleCollapsibleSection(target);
      }
    }
  };

  static PARTS = {
    sheet: {
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      root: true
    }
  };

  static TABS = {
    [TAB_GROUP]: {
      initial: "main",
      tabs: TAB_IDS.map((id) => ({ id }))
    }
  };

  private readonly flagsRepository: DwFlagsRepository;
  private readonly formDataHandler: FormDataHandler;

  constructor(...args: ConstructorParameters<typeof BaseV2Sheet>) {
    super(...args);
    this.flagsRepository = new DwFlagsRepository(this.actor);
    this.formDataHandler = new FormDataHandler(this.flagsRepository, this.actor);
  }

  protected async _prepareContext(options: Record<string, unknown>): Promise<Record<string, unknown>> {
    const context = await super._prepareContext(options as Record<string, unknown> & { isFirstRender: boolean });

    return DolmenwoodSheetData.populate(context as unknown as BaseSheetData, this.actor) as unknown as Record<
      string,
      unknown
    >;
  }

  protected _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: Record<string, unknown>
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId !== "sheet") return;

    registerAttackDamageRollChatListener();

    const jqFactory = (globalThis as { $?: (element: HTMLElement) => HtmlRoot }).$;

    if (jqFactory) {
      registerEquipmentListener(jqFactory(htmlElement));
    }

    this.applySavedSpellsUiState(htmlElement);
  }

  protected async _processSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: foundry.applications.ux.FormDataExtended,
    options?: unknown
  ): Promise<void> {
    const rawFormData = foundry.utils.flattenObject(
      foundry.utils.duplicate(formData.object) as Record<string, unknown>
    ) as Record<string, unknown>;
    const processedData = await this.formDataHandler.handleFormData(rawFormData);

    this.syncProcessedDataToFormData(formData, processedData);

    await super._processSubmitData(event, form, formData, options);
  }

  protected async _preClose(options: Record<string, unknown>): Promise<void> {
    const closeOptions = options as { submitted?: boolean };

    if (!closeOptions.submitted && this.form && this.isEditable) {
      try {
        await this.submit();
      } catch (error) {
        reportError("Failed to submit Dolmenwood V2 sheet on close.", error);
      }
    }

    await super._preClose(options);
  }

  protected async _onDropItem(
    event: DragEvent,
    item: Item.Implementation
  ): Promise<Item.Implementation | null> {
    return SpellsAbilitiesDropHandler.handleDrop({
      event,
      item,
      onAcceptedDrop: () => super._onDropItem(event, item),
      localize: this.localize
    });
  }

  private syncProcessedDataToFormData(
    formData: foundry.applications.ux.FormDataExtended,
    flattenedData: Record<string, unknown>
  ): void {
    const expandedData = foundry.utils.expandObject(
      foundry.utils.duplicate(flattenedData) as Record<string, unknown>
    ) as Record<string, unknown>;
    const objectTarget = formData.object as Record<string, unknown>;

    for (const key of Object.keys(objectTarget)) {
      delete objectTarget[key];
    }

    Object.assign(objectTarget, expandedData);

    const keys: string[] = [];

    formData.forEach((_, key) => keys.push(key));

    for (const key of keys) {
      formData.delete(key);
    }

    for (const [key, value] of Object.entries(flattenedData)) {
      formData.set(key, value as string | Blob);
    }
  }

  private async handleRollSave(target: HTMLElement): Promise<void> {
    const key = String(target.dataset.key ?? "");
    const dw = this.flagsRepository.get();
    const rollTarget = Number(foundry.utils.getProperty(dw, `saves.${key}`) ?? 0);

    await RollChecks.rollTargetCheck(
      this.actor,
      `${this.localize("DOLMENWOOD.Roll.SavePrefix")}: ${prettyKey(key)}`,
      rollTarget
    );
  }

  private async handleRollSkill(target: HTMLElement): Promise<void> {
    const key = String(target.dataset.key ?? "");
    const dw = this.flagsRepository.get();
    const targetRaw = Number(foundry.utils.getProperty(dw, `skills.${key}`) ?? 6);
    const rollTarget = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

    await RollChecks.rollSkillCheck(
      this.actor,
      `${this.localize("DOLMENWOOD.Roll.SkillPrefix")}: ${prettyKey(key)}`,
      rollTarget
    );
  }

  private async handleRollAbility(target: HTMLElement): Promise<void> {
    const label = String(target.dataset.label ?? "");
    const mod = Number(target.dataset.mod ?? 0);

    await RollChecks.rollAbilityCheck(this.actor, label, mod);
  }

  private async handleRollAttack(target: HTMLElement): Promise<void> {
    const attackType = String(target.dataset.attack ?? "")
      .trim()
      .toLowerCase();
    const abilityKey = ATTACK_TO_ABILITY[attackType];
    const attackBonusPath = ATTACK_TO_BONUS_PATH[attackType];
    const attackBonusInputName = ATTACK_TO_BONUS_INPUT[attackType];
    const damagePath = ATTACK_TO_DAMAGE_PATH[attackType];
    const damageInputName = ATTACK_TO_DAMAGE_INPUT[attackType];

    if (!abilityKey || !attackBonusPath || !attackBonusInputName || !damagePath || !damageInputName) {
      return;
    }

    const abilityLabels: Record<"str" | "dex", string> = {
      str: this.localize("DOLMENWOOD.Ability.Strength"),
      dex: this.localize("DOLMENWOOD.Ability.Dexterity")
    };
    const attackLabels: Record<string, string> = {
      melee: this.localize("DOLMENWOOD.UI.MeleeAttack"),
      ranged: this.localize("DOLMENWOOD.UI.RangedAttack")
    };
    const abilities = buildAbilities(this.actor.system as Record<string, unknown>);
    const ability = abilities.find((entry) => entry.key === abilityKey);
    const abilityMod = this.asFiniteNumber(ability?.mod);
    const form = target.closest("form");
    const inputValue = form?.querySelector<HTMLInputElement>(`input[name='${attackBonusInputName}']`)?.value;
    const attackBonus =
      typeof inputValue === "string"
        ? this.asFiniteNumber(inputValue)
        : this.asFiniteNumber(foundry.utils.getProperty(this.actor, `flags.${MODULE_ID}.dw.${attackBonusPath}`));
    const damageInput = form?.querySelector<HTMLInputElement>(`input[name='${damageInputName}']`) ?? null;
    const storedDamageFormula = foundry.utils.getProperty(this.actor, `flags.${MODULE_ID}.dw.${damagePath}`);
    const damageFormula = (
      damageInput
        ? damageInput.value
        : typeof storedDamageFormula === "string"
          ? storedDamageFormula
          : ""
    ).trim();
    const adjustedDamageFormula = this.getDamageFormula({
      attackType,
      baseFormula: damageFormula,
      strengthModifier: abilityMod
    });
    const mod = abilityMod + attackBonus;

    await RollChecks.rollAttackCheck(
      this.actor,
      attackLabels[attackType],
      abilityLabels[abilityKey],
      mod,
      [
        { value: abilityMod, label: abilityKey.toUpperCase() },
        { value: attackBonus, label: "BONUS" }
      ],
      adjustedDamageFormula
    );
  }

  private async handleRollExtraSkill(target: HTMLElement): Promise<void> {
    const row = target.closest(".dw-skill__extra");
    const nameInput = row?.querySelector<HTMLInputElement>("input[name^='dw.extraSkills.'][name$='.name']");
    const targetInput = row?.querySelector<HTMLInputElement>("input[name^='dw.extraSkills.'][name$='.target']");
    const fallbackName = String(target.dataset.name ?? "SKILL").trim() || "SKILL";
    const skillName = String(nameInput?.value ?? fallbackName).trim() || "SKILL";
    const targetRaw = Number(targetInput?.value ?? 6);
    const rollTarget = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

    await RollChecks.rollSkillCheck(
      this.actor,
      `${this.localize("DOLMENWOOD.Roll.SkillPrefix")}: ${skillName.toUpperCase()}`,
      rollTarget
    );
  }

  private async handleAddSkill(): Promise<void> {
    const dw = this.flagsRepository.get();

    dw.extraSkills = this.readExtraSkillsFromForm(dw.extraSkills);

    if (dw.extraSkills.length >= 10) return;

    dw.extraSkills.push({ name: "", target: 6 });
    await this.flagsRepository.set(dw);
  }

  private async handleRemoveSkill(target: HTMLElement): Promise<void> {
    const skillIndex = Number(target.dataset.index);

    if (!Number.isFinite(skillIndex)) return;

    const dw = this.flagsRepository.get();

    dw.extraSkills = this.readExtraSkillsFromForm(dw.extraSkills);

    if (skillIndex < 0 || skillIndex >= dw.extraSkills.length) return;

    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: this.localize("DOLMENWOOD.UI.RemoveSkillTitle") },
      content: `<p>${this.localize("DOLMENWOOD.UI.RemoveSkillConfirm")}</p>`,
      modal: true,
      rejectClose: false
    });

    if (!confirmed) return;

    dw.extraSkills.splice(skillIndex, 1);
    await this.flagsRepository.set(dw);
  }

  private async handleOpenItem(target: HTMLElement): Promise<void> {
    const itemId = String(target.dataset.itemId ?? "");

    if (!itemId) return;

    const item = this.actor.items.get(itemId);

    if (!item) return;

    void item.sheet?.render(true);
  }

  private async handleDeleteItem(target: HTMLElement): Promise<void> {
    const itemId = String(target.dataset.itemId ?? "");

    if (!itemId) return;

    const item = this.actor.items.get(itemId);

    if (!item) return;

    await item.deleteDialog();
  }

  private async handleSetSpellsTraitsView(target: HTMLElement): Promise<void> {
    const toggleMode = this.asToggleViewMode(target.dataset.view);

    if (!toggleMode) return;

    const container = this.element?.querySelector<HTMLElement>(".dw-spells-abilities");

    if (!container) return;

    const cardsButton = container.querySelector<HTMLElement>(
      `[data-action='${DW_SET_SPELLS_TRAITS_VIEW}'][data-view='cards']`
    );
    const textButton = container.querySelector<HTMLElement>(
      `[data-action='${DW_SET_SPELLS_TRAITS_VIEW}'][data-view='text']`
    );

    if (!cardsButton || !textButton) return;

    const currentCards = cardsButton.classList.contains("is-active");
    const currentText = textButton.classList.contains("is-active");
    const nextCards = toggleMode === "cards" ? !currentCards : currentCards;
    const nextText = toggleMode === "text" ? !currentText : currentText;
    const nextMode = this.viewModeFromStates({ cards: nextCards, text: nextText });

    if (!nextMode) return;

    this.applyViewMode(container, nextMode);
    this.updateCardsCollapsedLayoutClass(container);

    const dw = this.flagsRepository.get();

    if (dw.meta.spellsTraitsView === nextMode) return;

    dw.meta.spellsTraitsView = nextMode;
    await this.flagsRepository.set(dw);
  }

  private async handleToggleCollapsibleSection(target: HTMLElement): Promise<void> {
    const root = target.closest(".dw-spells, .dw-ability-items");

    if (!(root instanceof HTMLElement)) return;

    const section = root.closest(".dw-spells-abilities__section");
    const container = root.closest(".dw-spells-abilities");

    root.classList.toggle("is-collapsed");
    section?.classList.toggle("is-collapsed");

    const expanded = !root.classList.contains("is-collapsed");
    target.setAttribute("aria-expanded", String(expanded));

    if (container instanceof HTMLElement) {
      this.updateCardsCollapsedLayoutClass(container);
    }

    const kind = this.getCollapseKind(root);

    if (!kind) return;

    const nextCollapsed = root.classList.contains("is-collapsed");
    const flags = this.flagsRepository.get();
    const prevCollapsed = kind === "spells" ? flags.meta.spellsCollapsed : flags.meta.traitsCollapsed;

    if (prevCollapsed === nextCollapsed) return;

    if (kind === "spells") {
      flags.meta.spellsCollapsed = nextCollapsed;
    } else {
      flags.meta.traitsCollapsed = nextCollapsed;
    }

    await this.flagsRepository.set(flags);
  }

  private applySavedSpellsUiState(root: HTMLElement): void {
    const container = root.querySelector<HTMLElement>(".dw-spells-abilities");

    if (!container) return;

    const dw = this.flagsRepository.get();
    const savedMode = this.asViewMode(dw?.meta?.spellsTraitsView);

    this.applyViewMode(container, savedMode ?? "both");

    const spellsRoot = container.querySelector<HTMLElement>(".dw-spells");
    const traitsRoot = container.querySelector<HTMLElement>(".dw-ability-items");

    if (spellsRoot) {
      this.applyCollapsedState(spellsRoot, Boolean(dw.meta.spellsCollapsed));
    }

    if (traitsRoot) {
      this.applyCollapsedState(traitsRoot, Boolean(dw.meta.traitsCollapsed));
    }

    this.updateCardsCollapsedLayoutClass(container);
  }

  private applyViewMode(
    container: HTMLElement,
    mode: (typeof VIEW_MODES)[number]
  ): void {
    container.classList.remove(...VIEW_CLASSES.split(" "));
    container.classList.add(`${VIEW_CLASS_PREFIX}${mode}`);
    const cardsButton = container.querySelector<HTMLElement>(
      `[data-action='${DW_SET_SPELLS_TRAITS_VIEW}'][data-view='cards']`
    );
    const textButton = container.querySelector<HTMLElement>(
      `[data-action='${DW_SET_SPELLS_TRAITS_VIEW}'][data-view='text']`
    );

    cardsButton?.classList.toggle("is-active", mode === "cards" || mode === "both");
    textButton?.classList.toggle("is-active", mode === "text" || mode === "both");
  }

  private applyCollapsedState(root: HTMLElement, collapsed: boolean): void {
    const section = root.closest(".dw-spells-abilities__section");
    const header = root.querySelector<HTMLElement>(`[data-action='${DW_TOGGLE_COLLAPSIBLE_SECTION}']`);

    root.classList.toggle("is-collapsed", collapsed);
    section?.classList.toggle("is-collapsed", collapsed);
    header?.setAttribute("aria-expanded", String(!collapsed));
  }

  private getCollapseKind(root: HTMLElement): "spells" | "traits" | null {
    const section = root.closest(".dw-spells-abilities__section");

    if (!(section instanceof HTMLElement)) return null;
    if (section.classList.contains("dw-spells-abilities__section--spells")) return "spells";
    if (section.classList.contains("dw-spells-abilities__section--traits")) return "traits";

    return null;
  }

  private updateCardsCollapsedLayoutClass(container: HTMLElement): void {
    const spellsCollapsed = Boolean(
      container.querySelector(".dw-spells-abilities__section--spells")?.classList.contains("is-collapsed")
    );
    const traitsCollapsed = Boolean(
      container.querySelector(".dw-spells-abilities__section--traits")?.classList.contains("is-collapsed")
    );

    container.classList.toggle(CARDS_COLLAPSED_LAYOUT_CLASS, spellsCollapsed || traitsCollapsed);
    container.classList.toggle(SPELLS_COLLAPSED_LAYOUT_CLASS, spellsCollapsed);
    container.classList.toggle(TRAITS_COLLAPSED_LAYOUT_CLASS, traitsCollapsed);

    if (!container.classList.contains("dw-spells-abilities--view-both")) {
      container.style.removeProperty(CARDS_ROW_HEIGHT_CSS_VAR);

      return;
    }

    const toolbar = container.querySelector(".dw-spells-abilities__toolbar");
    const notesSection = container.querySelector(".dw-spells-abilities__section--notes");
    const cardsDivider = container.querySelector(".dw-spells-abilities__divider--cards");
    const notesDivider = container.querySelector(".dw-spells-abilities__divider--notes");

    const availableCardsSpace =
      container.clientHeight -
      this.getVisibleElementHeight(toolbar) -
      this.getVisibleElementHeight(notesSection) -
      this.getVisibleElementHeight(cardsDivider) -
      this.getVisibleElementHeight(notesDivider);
    const rowHeight = Math.floor(availableCardsSpace / 2);

    if (rowHeight > 0) {
      container.style.setProperty(CARDS_ROW_HEIGHT_CSS_VAR, `${rowHeight}px`);
    } else {
      container.style.removeProperty(CARDS_ROW_HEIGHT_CSS_VAR);
    }
  }

  private getVisibleElementHeight(element: Element | null): number {
    if (!(element instanceof HTMLElement)) return 0;

    if (window.getComputedStyle(element).display === "none") return 0;

    return element.getBoundingClientRect().height;
  }

  private asViewMode(value: string | undefined): (typeof VIEW_MODES)[number] | null {
    const normalized = String(value ?? "").trim().toLowerCase();

    return VIEW_MODES.includes(normalized as (typeof VIEW_MODES)[number])
      ? (normalized as (typeof VIEW_MODES)[number])
      : null;
  }

  private asToggleViewMode(value: string | undefined): (typeof TOGGLE_VIEW_MODES)[number] | null {
    const normalized = String(value ?? "").trim().toLowerCase();

    return TOGGLE_VIEW_MODES.includes(normalized as (typeof TOGGLE_VIEW_MODES)[number])
      ? (normalized as (typeof TOGGLE_VIEW_MODES)[number])
      : null;
  }

  private viewModeFromStates({
    cards,
    text
  }: {
    cards: boolean;
    text: boolean;
  }): (typeof VIEW_MODES)[number] | null {
    if (!cards && !text) return null;
    if (cards && text) return "both";

    return cards ? "cards" : "text";
  }

  private readExtraSkillsFromForm(fallback: DwExtraSkill[]): DwExtraSkill[] {
    if (!this.form) return Array.isArray(fallback) ? fallback : [];

    const fields = this.form.querySelectorAll<HTMLInputElement>("input[name^='dw.extraSkills.']");

    if (!fields.length) return Array.isArray(fallback) ? fallback : [];

    const byIndex = new Map<number, DwExtraSkill>();

    for (const input of Array.from(fields)) {
      const match = input.name.match(/^dw\.extraSkills\.(\d+)\.(name|target)$/);

      if (!match) continue;

      const index = Number(match[1]);
      const key = match[2];

      if (!Number.isFinite(index)) continue;

      const current = byIndex.get(index) ?? { name: "", target: 6 };

      if (key === "name") current.name = input.value ?? "";

      if (key === "target") {
        const targetRaw = Number(input.value ?? 6);

        current.target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;
      }

      byIndex.set(index, current);
    }

    return Array.from(byIndex.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, skill]) => skill);
  }

  private asFiniteNumber(value: unknown): number {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private appendNumericModifier(formula: string, modifier: number): string {
    const normalizedFormula = formula.trim();

    if (!normalizedFormula) return "";

    const normalizedModifier = this.asFiniteNumber(modifier);

    if (!normalizedModifier) return normalizedFormula;

    const sign = normalizedModifier > 0 ? "+" : "-";

    return `${normalizedFormula} ${sign} ${Math.abs(normalizedModifier)}`;
  }

  private getDamageFormula({
    attackType,
    baseFormula,
    strengthModifier
  }: {
    attackType: string;
    baseFormula: string;
    strengthModifier: number;
  }): string {
    if (attackType !== "melee") return baseFormula;

    return this.appendNumericModifier(baseFormula, strengthModifier);
  }

  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}

import type { DwFlags, DwFormFields } from "../types.js";

type FieldsApi = typeof foundry.data.fields;
type AnyField = foundry.data.fields.DataField.Any;

let cachedDwSchema: AnyField | null | undefined;

function getFieldsApi(): FieldsApi | null {
  return globalThis.foundry?.data?.fields ?? null;
}

function stringField(fields: FieldsApi): AnyField {
  return new fields.StringField({
    required: true,
    nullable: false,
    blank: true,
    initial: ""
  });
}

function htmlField(fields: FieldsApi): AnyField {
  return new fields.HTMLField({
    required: true,
    nullable: false,
    blank: true,
    initial: ""
  });
}

function spellsTraitsViewField(fields: FieldsApi): AnyField {
  return new fields.StringField({
    required: true,
    nullable: false,
    blank: false,
    initial: "both"
  });
}

function booleanField(fields: FieldsApi, { initial = false }: { initial?: boolean } = {}): AnyField {
  return new fields.BooleanField({
    required: true,
    nullable: false,
    initial
  });
}

function numberField(
  fields: FieldsApi,
  {
    initial = 0,
    min
  }: {
    initial?: number;
    min?: number;
  } = {}
): AnyField {
  return new fields.NumberField({
    required: true,
    nullable: false,
    integer: true,
    initial,
    min
  });
}

function buildEquipmentSchema(fields: FieldsApi): AnyField {
  const { SchemaField } = fields;
  const equipmentFields: Record<string, AnyField> = {
    tinyItems: stringField(fields)
  };

  for (let i = 1; i <= 10; i += 1) {
    equipmentFields[`equipped${i}`] = stringField(fields);
    equipmentFields[`equippedWeight${i}`] = stringField(fields);
  }

  for (let i = 1; i <= 16; i += 1) {
    equipmentFields[`stowed${i}`] = stringField(fields);
    equipmentFields[`stowedWeight${i}`] = stringField(fields);
  }

  return new SchemaField(equipmentFields);
}

function buildDwFlagsSchema(fields: FieldsApi): AnyField {
  const { SchemaField, ArrayField } = fields;

  const extraSkillSchema = new SchemaField({
    name: stringField(fields),
    target: numberField(fields, { initial: 6, min: 1 })
  });

  return new SchemaField({
    saves: new SchemaField({
      doom: numberField(fields, { min: 0 }),
      hold: numberField(fields, { min: 0 }),
      spell: numberField(fields, { min: 0 }),
      ray: numberField(fields, { min: 0 }),
      blast: numberField(fields, { min: 0 }),
      magic: numberField(fields, { min: 0 })
    }),
    skills: new SchemaField({
      listen: numberField(fields, { initial: 6, min: 0 }),
      search: numberField(fields, { initial: 6, min: 0 }),
      survival: numberField(fields, { initial: 6, min: 0 })
    }),
    extraSkills: new ArrayField(extraSkillSchema, {
      required: true,
      nullable: false,
      initial: () => []
    }),
    movement: new SchemaField({
      speed: numberField(fields, { min: 0 }),
      exploring: numberField(fields, { min: 0 }),
      overland: numberField(fields, { min: 0 })
    }),
    combat: new SchemaField({
      attack: numberField(fields, { min: 0 })
    }),
    meta: new SchemaField({
      spellsCollapsed: booleanField(fields, { initial: false }),
      traitsCollapsed: booleanField(fields, { initial: false }),
      spellsTraitsView: spellsTraitsViewField(fields),
      kindredClass: stringField(fields),
      kindredClassTraits: htmlField(fields),
      background: stringField(fields),
      alignment: stringField(fields),
      affiliation: stringField(fields),
      moonSign: stringField(fields),
      languages: stringField(fields),
      equipment: buildEquipmentSchema(fields),
      xp: numberField(fields, { min: 0 }),
      level: numberField(fields, { initial: 1, min: 0 }),
      nextLevel: numberField(fields, { min: 0 }),
      modifier: numberField(fields),
      coins: new SchemaField({
        copper: numberField(fields, { min: 0 }),
        silver: numberField(fields, { min: 0 }),
        gold: numberField(fields, { min: 0 }),
        pellucidium: numberField(fields, { min: 0 })
      }),
      otherNotes: htmlField(fields)
    })
  });
}

export function getDwFlagsSchema(): AnyField | null {
  if (cachedDwSchema !== undefined) return cachedDwSchema;

  const fields = getFieldsApi();

  if (!fields) {
    cachedDwSchema = null;

    return cachedDwSchema;
  }

  cachedDwSchema = buildDwFlagsSchema(fields);

  return cachedDwSchema;
}

export function getDwSchemaInitialData(): DwFlags | null {
  const schema = getDwFlagsSchema();

  if (!schema) return null;

  return schema.getInitialValue() as DwFlags;
}

export function cleanDwFlagsWithSchema(dw: unknown): DwFlags | null {
  const schema = getDwFlagsSchema();

  if (!schema) return null;

  return schema.clean(dw as Record<string, unknown>) as DwFlags;
}

function getFieldMap(field: unknown): Record<string, unknown> | null {
  if (!field || typeof field !== "object") return null;

  const maybeFields = (field as { fields?: unknown }).fields;

  if (!maybeFields || typeof maybeFields !== "object") return null;

  return maybeFields as Record<string, unknown>;
}

export function getDwFormFields(): DwFormFields | null {
  const rootFields = getFieldMap(getDwFlagsSchema());

  if (!rootFields) return null;

  const metaFields = getFieldMap(rootFields.meta);

  if (!metaFields) return null;

  const kindredClassTraits = metaFields.kindredClassTraits;
  const otherNotes = metaFields.otherNotes;

  if (!kindredClassTraits || !otherNotes) return null;

  return {
    meta: {
      kindredClassTraits: kindredClassTraits as AnyField,
      otherNotes: otherNotes as AnyField
    }
  };
}

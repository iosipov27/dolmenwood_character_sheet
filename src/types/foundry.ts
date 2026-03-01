export type ActorSheetConstructor = typeof ActorSheet;

export interface SheetClassConfigLike {
  label?: string;
  cls?: ActorSheetConstructor;
  id?: string;
  namespace?: string;
}

export type BaseSheetData = ReturnType<ActorSheet["getData"]>;

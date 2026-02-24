import type { JQueryWithOn } from "../types/index.js";
import { reportError } from "./reportError.js";

export interface EditableTextareaConfig {
  contentElement: JQueryWithOn<HTMLElement>;
  setValue: (value: string) => Promise<void>;
  errorMessage?: string;
}

export class EditableTextarea {
  private readonly contentElement: JQueryWithOn<HTMLElement>;
  private readonly setValue: (value: string) => Promise<void>;
  private readonly errorMessage: string;

  constructor(config: EditableTextareaConfig) {
    this.contentElement = config.contentElement;
    this.setValue = config.setValue;
    this.errorMessage = config.errorMessage ?? "Failed to save textarea value.";

    this.attachListeners();
  }

  private attachListeners(): void {
    this.contentElement.on("blur", () => {
      void this.save();
    });
  }

  private async save(): Promise<void> {
    const element = this.contentElement.get(0);

    if (!element) return;

    const plain = element.innerText
      .replace(/\u00A0/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/^\n+/, "")
      .trimEnd();

    element.textContent = plain;

    try {
      await this.setValue(plain);
    } catch (error) {
      reportError(this.errorMessage, error);
    }
  }
}

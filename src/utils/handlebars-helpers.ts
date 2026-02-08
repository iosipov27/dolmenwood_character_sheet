export function registerHandlebarsHelpers(): void {
  Handlebars.registerHelper("uppercase", function (aString: string) {
    return aString.toUpperCase();
  });

  Handlebars.registerHelper("concat", function (...args: unknown[]) {
    const values = args.slice(0, -1);
    return values.map((value) => String(value ?? "")).join("");
  });

  Handlebars.registerHelper("range", function (...args: unknown[]) {
    const values = args.slice(0, -1);
    const startRaw = values.length >= 2 ? values[0] : 1;
    const endRaw = values.length >= 2 ? values[1] : values[0];

    const start = Number(startRaw);
    const end = Number(endRaw);

    if (!Number.isFinite(start) || !Number.isFinite(end)) return [];

    const step = start <= end ? 1 : -1;
    const result: number[] = [];

    for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
      result.push(i);
    }

    return result;
  });

  Handlebars.registerHelper("nl2br", function (text: string) {
    const sanitized = String(text ?? "");
    return new Handlebars.SafeString(sanitized.replace(/\n/g, "<br>"));
  });
}

export function registerHandlebarsHelpers(): void {
  Handlebars.registerHelper("uppercase", function (aString: string) {
    return aString.toUpperCase();
  });
}

const rules = new Intl.PluralRules("en-US");
// "1 Comment", "0 Comments", "2 Suggestions": the noun follows the count.
export function pluralize(count: number, one: string, other: string): string {
  return `${count} ${rules.select(count) === "one" ? one : other}`;
}

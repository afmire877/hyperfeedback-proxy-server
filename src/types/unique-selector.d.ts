declare module 'unique-selector' {
  export type Selector = string;

  export type SelectorType = 'ID' | 'Class' | 'Tag' | 'NthChild' | 'Attributes';

  export type Options = {
    readonly selectorTypes?: readonly SelectorType[];
    readonly attributesToIgnore?: readonly string[];
    readonly excludeRegex?: RegExp | null;
  };

  declare function unique(element: Element, options?: Options): Selector;

  export = unique;
}

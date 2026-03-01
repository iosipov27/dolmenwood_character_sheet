export type HtmlRoot = JQuery<HTMLElement>;

export type ActionEvent<T extends HTMLElement = HTMLElement> = Event & {
  currentTarget: T;
  preventDefault(): void;
};

export type ActionHandler<T extends HTMLElement = HTMLElement> = (
  event: ActionEvent<T>
) => void | Promise<void>;

export type JQueryWithOn<T extends HTMLElement = HTMLElement> = JQuery<T> & {
  on(event: string, handler: (ev: ActionEvent<T>) => void): JQuery<T>;
};

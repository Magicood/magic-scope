import { createStore, type Store } from './store';

export interface DisclosureOptions {
  /** 受控开合值(给了即受控)。 */
  open?: boolean;
  /** 非受控初始值。 */
  defaultOpen?: boolean;
  /** 开合变化回调(受控/非受控都会触发)。 */
  onOpenChange?(open: boolean): void;
}

export interface Disclosure extends Store<{ open: boolean }> {
  setOpen(next: boolean): void;
  toggle(): void;
}

/**
 * 开合状态原语 —— Popover / Dialog / Menu / Tooltip 等浮层共用。
 * 受控时只回调 onOpenChange、不改内部;非受控时改内部并回调。「显隐怎么算」在 core,
 * 「showPopover()/showModal() 怎么施加」留各框架薄壳。
 */
export function createDisclosure(options: DisclosureOptions = {}): Disclosure {
  const store = createStore({ open: options.defaultOpen ?? false });
  const isControlled = options.open !== undefined;
  const currentOpen = (): boolean =>
    isControlled ? (options.open as boolean) : store.getState().open;

  const setOpen = (next: boolean): void => {
    if (next === currentOpen()) {
      return;
    }
    if (!isControlled) {
      store.setState({ open: next });
    }
    options.onOpenChange?.(next);
  };

  return {
    getState: () => ({ open: currentOpen() }),
    subscribe: store.subscribe,
    setOpen,
    toggle: () => setOpen(!currentOpen()),
  };
}

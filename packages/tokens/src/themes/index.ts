import type { ThemeContract } from '../contract/contract';
import { arcaneDark } from './arcane';
import { arcaneLight } from './arcane-light';

export { arcaneDark, arcaneLight };

/** 内置预设主题(供 registerThemes 一次注册;深色奥术为默认)。 */
export const presetThemes: ThemeContract[] = [arcaneDark, arcaneLight];

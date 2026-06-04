import { StyleName, ThemeName } from './types';

export const THEMES = new Set<ThemeName>([
    'india',
    'mindaro',
    'navy',
    'pink',
    'rust',
    'syracuse',
    'tea-light',
    'tea-dark',
    'tomato'
]);
export const DARK_THEMES = new Set<ThemeName>([
    'india',
    'navy',
    'rust',
    'tea-dark'
]);
export const LIGHT_THEMES = new Set<ThemeName>([
    'mindaro',
    'pink',
    'syracuse',
    'tea-light',
    'tomato'
]);

export const STYLES = new Set<StyleName>([
    'active',
    'body',
    'content',
    'divider',
    'exit',
    'hazard',
    'inactive',
    'info',
    'main',
    'neutral',
    'none',
    'primary-compliment',
    'primary',
    'secondary-compliment',
    'secondary',
    'success',
    'trinary-compliment',
    'trinary',
    'warning'
]);
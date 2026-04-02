export type ThemeName = 'india' | 'mindaro' | 'navy' | 'pink' | 'rust' | 'syracuse' | 'tea-light' | 'tea-dark' | 'tomato';

export type ColorScheme = 'light' | 'dark';

export type StyleFormat = 'f' | 'b' | 't' | 'ts' | 'bs';
export type PaletteStyle = 'primary' | 'secondary' | 'trinary' | 'primary-compliment' | 'secondary-compliment' | 'trinary-compliment' | 'main' | 'body' | 'content' | 'divider';
export type CommonStyle = 'success' | 'hazard' | 'warning' | 'info' | 'exit' | 'active' | 'inactive' | 'neutral';
export type StyleMode = 'c' | 'i';
export type StyleName = 'none' | PaletteStyle | CommonStyle

export interface StyleOption {
    style: StyleName;
    mode?: StyleMode;
    mono?: number;
}

export interface IThemeOptions {
    background?: StyleOption
    border?: StyleOption
    text?: StyleOption
    textShadow?: StyleOption
    boxShadow?: StyleOption
}

export interface ThemeOptionsModifier {
    listable?: 0 | 1
}

export interface ITheme {
    inverse: string
    scheme: ColorScheme
    name: string
}
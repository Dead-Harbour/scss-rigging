export type ThemeName = 'india' | 'mindaro' | 'navy' | 'pink' | 'rust' | 'syracuse' | 'tea' | 'tomato';
export const THEMES = new Set<ThemeName>(['india', 'mindaro', 'navy', 'pink', 'rust', 'syracuse', 'tea', 'tomato']);
export const DARK_THEMES = new Set<ThemeName>(['india', 'navy', 'rust']);
export const LIGHT_THEMES = new Set<ThemeName>(['mindaro', 'pink', 'syracuse', 'tea', 'tomato']);

export type ColorScheme = 'light' | 'dark';

export type StyleFormat = 'f' | 'b' | 'c';
export type PaletteStyle = 'primary' | 'secondary' | 'trinary' | 'primary-compliment' | 'secondary-compliment' | 'trinary-compliment' | 'main' | 'body' | 'content' | 'divider';
export type CommonStyle = 'success' | 'hazard' | 'warning' | 'info' | 'exit' | 'active' | 'inactive' | 'neutral';
export type StyleMode = 'c' | 'i';
export type StyleName = 'none' | PaletteStyle | CommonStyle

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

function getStyleClass(format: StyleFormat, style: StyleName, mode?: StyleMode, mono?: number) {
    if (style === 'none')
        return '';

    let styleClass = `${format}-${style}`;

    if (mono) {
        if (mono < 0)
            styleClass += `-d${-mono}`;
        else
            styleClass += `-l${mono}`;
    }

    if (mode)
        return styleClass + `-${mode}`;

    return styleClass;
}

function backgroundStyle(style: StyleName, mode?: StyleMode, mono?: number) {
    return getStyleClass('f', style, mode, mono);
}

function borderStyle(style: StyleName, mode?: StyleMode, mono?: number) {
    return getStyleClass('b', style, mode, mono);
}

function colorStyle(style: StyleName, mode?: StyleMode, mono?: number) {
    return getStyleClass('c', style, mode, mono);
}

export type ThemeListener = (theme: ThemeName, colorScheme: ColorScheme) => void;

const THEME_CHANGE_CLASS = '__theme-change';
const COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)';
const COLOR_SCHEME_LIGHT = '(prefers-color-scheme: light)';

export interface IThemeOption {
    style?: StyleName
    mode?: StyleMode
    mono?: number
}

export type ThemeOption = IThemeOption & {
    style: StyleName
}

export interface ThemeOptions<T extends IThemeOption> {
    background?: T
    border?: T
    color?: T
}

export type ThemeProp = ThemeOptions<ThemeOption>

export interface ThemeProps {
    theme?: ThemeProp
}

export class Theme {
    private readonly listeners = new Map<string, ThemeListener>();
    private readonly themeAnimationDelay = 2000;
    private readonly themes = new Set<ThemeName>();

    private readonly LOCALSTORAGE_THEME_KEY = 'theme';
    private readonly LOCALSTORAGE_COLOR_SCHEME_KEY = 'color_scheme';

    private defaultColorScheme?: ColorScheme;
    private defaultTheme?: ThemeName;
    private themeChangeTimeout?: NodeJS.Timeout;

    // eslint-disable-next-line class-methods-use-this
    getStyles(theme?: ThemeOptions<ThemeOption>) {
        if (!theme)
            return '';

        const list: string[] = [];
        if (theme.background)
            list.push(backgroundStyle(theme.background.style, theme.background.mode, theme.background.mono));
        if (theme.border)
            list.push(borderStyle(theme.border.style, theme.border.mode, theme.border.mono));
        if (theme.color)
            list.push(colorStyle(theme.color.style, theme.color.mode, theme.color.mono));

        if (list.length === 0)
            return '';

        return list.join(' ');
    }

    getBasicStyling(style: StyleName, theme?: ThemeOptions<IThemeOption>) {
        return this.getStyles({
            background: {
                style,
                ...theme?.background
            },
            border: {
                mono: 1,
                style,
                ...theme?.border
            },
            ...theme?.color
        });
    }

    private updateTheme(theme: ThemeName) {
        console.debug('Update theme to:', theme);

        document.body.classList.remove(...this.getThemeList());
        document.body.classList.add(theme, THEME_CHANGE_CLASS);

        clearTimeout(this.themeChangeTimeout);

        this.themeChangeTimeout = setTimeout(() => {
            document.body.classList.remove(THEME_CHANGE_CLASS);
            this.themeChangeTimeout = undefined;
        }, this.themeAnimationDelay);

        const colorScheme = this.getColorScheme();
        for (const [, listener] of this.listeners)
            listener(theme, colorScheme);
    }

    private onColorSchemeChange() {
        console.debug('On color scheme change...');

        let theme = this.getTheme();
        console.debug('Current theme:', theme);

        if (!theme || !this.themes.has(theme)) {
            console.warn('Theme is undefined or not in supported list; getting default theme');
            theme = this.getDefaultTheme();
        }

        if (!theme)
            throw new Error('Failed to get theme on color scheme change');

        const colorScheme = this.getColorScheme();

        if (colorScheme === 'dark' && !DARK_THEMES.has(theme)) {
            [theme] = Array.from(LIGHT_THEMES);
            console.warn('Using dark color scheme but selected theme is not in list; setting to', theme);
        }
        else if (colorScheme === 'light' && !LIGHT_THEMES.has(theme)) {
            [theme] = Array.from(DARK_THEMES);
            console.warn('Using light color scheme but selected theme is not in list; setting to', theme);
        }

        if (!theme)
            throw new Error('Failed to get theme on color scheme change after selecting defaults');

        this.setTheme(theme);
    }

    addListener(key: string, listener: ThemeListener) {
        this.listeners.set(key, listener);
    }

    removeListener(key: string) {
        this.listeners.delete(key);
    }

    getColorScheme(): ColorScheme {
        const colorScheme = globalThis.localStorage.getItem(this.LOCALSTORAGE_COLOR_SCHEME_KEY);
        if (colorScheme) {
            if (colorScheme !== 'dark' && colorScheme !== 'light')
                globalThis.localStorage.removeItem(this.LOCALSTORAGE_COLOR_SCHEME_KEY);
            else
                return colorScheme;
        }

        if (globalThis.matchMedia(COLOR_SCHEME_DARK).matches)
            return 'dark';

        if (globalThis.matchMedia(COLOR_SCHEME_LIGHT).matches)
            return 'light';

        return this.defaultColorScheme ?? 'dark';
    }

    getDefaultTheme(colorScheme?: ColorScheme) {
        if (this.defaultTheme)
            return this.defaultTheme;

        const cs = colorScheme ?? this.getColorScheme();

        if (cs === 'dark')
            return Array.from(DARK_THEMES)[0];

        return Array.from(LIGHT_THEMES)[0];
    }

    getTheme() {
        const theme = globalThis.localStorage.getItem(this.LOCALSTORAGE_THEME_KEY) as ThemeName | null;

        console.debug('Get theme; have:', theme);

        if (!theme || !this.themes.has(theme)) {
            console.warn('No theme or not in supported list; getting default theme...');

            globalThis.localStorage.removeItem(this.LOCALSTORAGE_THEME_KEY);

            return this.getDefaultTheme();
        }

        return theme;
    }

    setTheme(theme: ThemeName) {
        console.debug('Set theme:', theme);

        if (this.themes.has(theme)) {
            globalThis.localStorage.setItem(this.LOCALSTORAGE_THEME_KEY, theme);

            this.updateTheme(theme);
        }
        else {
            console.warn('Theme is not in supported list; getting current theme');

            const currentTheme = this.getTheme();
            if (currentTheme)
                this.updateTheme(currentTheme);
        }
    }

    setColorScheme(colorScheme?: ColorScheme) {
        if (colorScheme)
            globalThis.localStorage.setItem(this.LOCALSTORAGE_COLOR_SCHEME_KEY, colorScheme);
        else
            globalThis.localStorage.removeItem(this.LOCALSTORAGE_COLOR_SCHEME_KEY);

        this.onColorSchemeChange();
    }

    getThemeColorScheme(theme?: ThemeName): ColorScheme {
        const currentTheme = this.getTheme();
        const useTheme = theme ?? currentTheme;
        if (!useTheme)
            return 'dark';

        return DARK_THEMES.has(useTheme) && 'dark' || 'light';
    }

    getThemeList(colorScheme?: ColorScheme) {
        if (!colorScheme)
            return Array.from(this.themes);

        if (colorScheme === 'dark')
            return Array.from(this.themes).filter((theme) => DARK_THEMES.has(theme));

        return Array.from(this.themes).filter((theme) => LIGHT_THEMES.has(theme));
    }

    init(defaultColorScheme?: ColorScheme, defaultTheme?: ThemeName, allowedThemes?: Set<ThemeName>) {
        this.defaultColorScheme = defaultColorScheme;
        this.defaultTheme = defaultTheme;

        console.debug('Init themes with:', this.defaultColorScheme, this.defaultTheme);

        const useAllThemes = allowedThemes === undefined || allowedThemes.size === 0;

        if (useAllThemes) {
            console.debug('Using all themes...');

            for (const t of THEMES)
                this.themes.add(t);
        }
        else {
            console.debug('Allowed themes', allowedThemes);

            if (defaultTheme)
                this.themes.add(defaultTheme);

            for (const t of allowedThemes)
                this.themes.add(t);
        }

        try {
            if (globalThis.matchMedia) {
                globalThis.matchMedia(COLOR_SCHEME_DARK).addEventListener('change', this.onColorSchemeChange);
                globalThis.matchMedia(COLOR_SCHEME_LIGHT).addEventListener('change', this.onColorSchemeChange);
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            this.onColorSchemeChange();
        }

        return this;
    }

    constructor() {
        this.onColorSchemeChange = this.onColorSchemeChange.bind(this);
    }
}

export const themes = new Theme();
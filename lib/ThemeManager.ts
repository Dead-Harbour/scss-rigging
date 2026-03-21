import { ThemeOptions } from './ThemeOptions';
import type { ColorScheme, ITheme, IThemeOptions, StyleName, ThemeName } from './types';

export type ThemeListener = (theme: ThemeName, colorScheme: ColorScheme) => void;

const THEME_CHANGE_CLASS = 'theme-change-applied';
const COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)';
const COLOR_SCHEME_LIGHT = '(prefers-color-scheme: light)';

export class ThemeManager {

    private readonly darkThemes: ITheme[] = [];
    private readonly lightThemes: ITheme[] = [];
    private readonly themes = new Map<string, ITheme>();

    private readonly themeAnimationDelay = 2000;

    private defaultTheme?: ITheme;
    private themeChangeTimeout?: NodeJS.Timeout;

    private themeGetter: () => string;
    private readonly themeSetter: (theme: string) => void;
    private schemeGetter: () => ColorScheme | null;
    private readonly schemeSetter: (scheme: ColorScheme | null) => void;

    update(themeGetter: () => string, schemeGetter: () => ColorScheme | null) {
        this.themeGetter = themeGetter;
        this.schemeGetter = schemeGetter;

        return this;
    }

    private updatePageTheme(theme: ITheme) {
        console.debug('Update theme to', theme);

        document.body.classList.remove(...this.getThemeList().map((t) => t.name));
        document.body.classList.add(theme.name, THEME_CHANGE_CLASS);

        if (this.themeChangeTimeout)
            clearTimeout(this.themeChangeTimeout);

        this.themeChangeTimeout = setTimeout(() => {
            document.body.classList.remove(THEME_CHANGE_CLASS);

            this.themeChangeTimeout = undefined;
        }, this.themeAnimationDelay);
    }

    updateThemeByScheme() {
        const currentTheme = this.getTheme();
        const currentScheme = this.getScheme();

        console.debug('Update theme by scheme to', currentTheme?.name, currentScheme);

        if (currentTheme) {
            if (currentTheme.scheme === currentScheme) {
                console.debug('Current scheme does not match current theme\'s; inverting...');

                this.setTheme(this.themes.get(currentTheme.inverse));
            }
        }
        else if (currentScheme === 'light')
            this.setTheme(this.lightThemes[0]);
        else
            this.setTheme(this.darkThemes[0]);
    }

    getScheme() {
        if (globalThis.matchMedia(COLOR_SCHEME_DARK).matches) {
            console.debug('Prefer dark scheme');
            if (this.schemeGetter())
                this.setScheme();
            return 'dark';
        }

        if (globalThis.matchMedia(COLOR_SCHEME_LIGHT).matches) {
            console.debug('Prefer light scheme');
            if (this.schemeGetter())
                this.setScheme();
            return 'light';
        }

        console.debug('Get scheme from storage');

        return this.schemeGetter();
    }

    getDefaultTheme(scheme?: ColorScheme) {
        if (this.defaultTheme)
            return this.defaultTheme;

        const useScheme = scheme ?? this.getScheme();

        if (useScheme === 'light')
            return this.lightThemes[0];

        return this.darkThemes[0];
    }

    getTheme() {
        return this.themes.get(this.themeGetter());
    }

    setTheme(theme?: ITheme) {
        if (theme) {
            console.debug('Setting theme to', theme.name);

            this.themeSetter(theme.name);
            this.updatePageTheme(theme);
        }
        else if (this.defaultTheme)
            this.setTheme(this.defaultTheme);
    }

    setScheme(scheme?: ColorScheme) {
        this.schemeSetter(scheme ?? null);
    }

    getThemeScheme(theme?: ITheme) {
        return theme?.scheme ?? this.getScheme();
    }

    getThemeList(scheme?: ColorScheme) {
        if (!scheme)
            return [...this.darkThemes, ...this.lightThemes];

        if (scheme === 'light')
            return this.lightThemes;

        return this.darkThemes;
    }

    private setThemesByScheme(allowedThemes: string[]) {
        for (const [name, theme] of this.themes) {
            if (allowedThemes.includes(name)) {
                if (theme.scheme === 'light')
                    this.lightThemes.push(theme);
                else
                    this.darkThemes.push(theme);
            }
            else
                this.themes.delete(name);
        }
    }

    private init(defaultTheme?: string, ...allowedThemes: string[]) {
        if (defaultTheme)
            this.defaultTheme = this.themes.get(defaultTheme);

        if (allowedThemes.length > 0) {
            while (this.darkThemes.length > 0)
                this.darkThemes.pop();

            while (this.lightThemes.length > 0)
                this.lightThemes.pop();

            this.setThemesByScheme(allowedThemes);
        }

        return this;
    }

    basicTheme(theme: StyleName, options?: IThemeOptions) {
        return new ThemeOptions({
            background: {
                style: theme,
                ...options?.background
            },
            border: {
                mono: this.getScheme() === 'dark' && 1 || -1,
                style: theme,
                ...options?.border
            },
            boxShadow: options?.boxShadow,
            text: options?.text,
            textShadow: options?.textShadow
        });
    }

    private parseFromStylesheets() {
        const CLOSING_INDEX = -3;

        const sheets = Array.from(document.styleSheets)
            .filter((sheet) => {
                try {
                    return sheet.cssRules;
                }
                catch (e) {
                    console.warn('Unable to access stylesheet', sheet, e);
                    return false;
                }
            });

        const rules = sheets.flatMap((sheet) => Array.from(sheet.cssRules));

        console.warn(rules);

        const themes = rules
            .filter((rule) => rule.cssText.startsWith('body.theme {'))
            .map((rule) => rule.cssText.split('{')[1]?.slice(0, CLOSING_INDEX)?.trim())
            .flatMap((text) => text?.split(';').map((t) => t.trim()))
            .reduce((acc, cur) => {
                if (!cur) return acc;

                const [key, v] = cur?.split(':').map((s) => s.replace('--', '').trim()) ?? [];

                if (!key || !v) return acc;

                const [scheme, inverse] = v.split('|').map((s) => s.trim());

                if (!scheme || !inverse) return acc;

                return {
                    ...acc,
                    [key]: {
                        inverse,
                        name: key,
                        scheme: scheme as ColorScheme
                    }
                };
            }, {} as Record<string, ITheme>);

        for (const theme in themes) {
            const themeData = themes[theme];
            if (!themeData)
                continue;

            this.themes.set(theme, themeData);
            if (themeData.scheme === 'light')
                this.lightThemes.push(themeData);
            else
                this.darkThemes.push(themeData);
        }
    }

    private firstUpdate() {
        const theme = this.getTheme();
        if (theme)
            this.updatePageTheme(theme);

        try {
            globalThis.matchMedia(COLOR_SCHEME_DARK).addEventListener('change', () => this.updateThemeByScheme());
            globalThis.matchMedia(COLOR_SCHEME_LIGHT).addEventListener('change', () => this.updateThemeByScheme());

            this.updateThemeByScheme();
        }
        catch (err) {
            console.warn('Unable to listen to color scheme changes', err);
        }
    }

    constructor(themeGetter: () => string, themeSetter: (theme: string) => void, schemeGetter: () => ColorScheme | null, schemeSetter: (scheme: ColorScheme | null) => void) {
        this.themeGetter = themeGetter;
        this.themeSetter = themeSetter;
        this.schemeGetter = schemeGetter;
        this.schemeSetter = schemeSetter;

        this.parseFromStylesheets();
        this.init();
        this.firstUpdate();

        this.updateThemeByScheme = this.updateThemeByScheme.bind(this);
    }
}
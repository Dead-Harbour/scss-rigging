import { backgroundStyle, borderStyle, boxShadowStyle, textShadowStyle, textStyle } from './helpers';
import { IThemeOptions, StyleOption, ThemeOptionsModifier } from './types';

function getOptions(opt: ThemeOptions, ...options: (IThemeOptions | undefined)[]) {
    if (options.length === 0)
        return opt;

    return options.reduce((acc, option) => ({
        ...acc,
        ...option
    }), opt);
}

export interface ThemeProps {
    theme?: ThemeOptions
}

export class ThemeOptions implements IThemeOptions {

    readonly background?: StyleOption;
    readonly border?: StyleOption;
    readonly text?: StyleOption;
    readonly textShadow?: StyleOption;
    readonly boxShadow?: StyleOption;

    getClasses(modifier?: ThemeOptionsModifier) {
        const classes: string[] = [];

        if (modifier?.listable === 1)
            classes.push('li');

        if (this.background)
            classes.push(backgroundStyle(this.background));

        if (this.border)
            classes.push(borderStyle(this.border));

        if (this.text)
            classes.push(textStyle(this.text));

        if (this.textShadow)
            classes.push(textShadowStyle(this.textShadow));

        if (this.boxShadow)
            classes.push(boxShadowStyle(this.boxShadow));

        return classes;
    }

    toClassName(modifier?: ThemeOptionsModifier) {
        const classes = this.getClasses(modifier);

        return classes.join(' ');
    }

    merge(...options: (IThemeOptions | undefined)[]) {
        const option = getOptions(this, ...options);

        return new ThemeOptions(option);
    }

    conditional(flag: boolean, a: (IThemeOptions | undefined)[], b: (IThemeOptions | undefined)[]) {
        if (flag)
            return this.merge(...a);

        return this.merge(...b);
    }

    constructor(...options: (IThemeOptions | undefined)[]) {
        const option = getOptions(this, ...options);

        if (option) {
            this.background = option.background;
            this.border = option.border;
            this.text = option.text;
            this.textShadow = option.textShadow;
            this.boxShadow = option.boxShadow;
        }
    }
}
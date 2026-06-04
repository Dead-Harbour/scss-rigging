import type { StyleFormat, StyleMode, StyleName, StyleOption } from './types';

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

export function backgroundStyle(styleOptions: StyleOption) {
    return getStyleClass('f', styleOptions.style, styleOptions.mode, styleOptions.mono);
}

export function borderStyle(styleOptions: StyleOption) {
    return getStyleClass('b', styleOptions.style, styleOptions.mode, styleOptions.mono);
}

export function textStyle(styleOptions: StyleOption) {
    return getStyleClass('t', styleOptions.style, styleOptions.mode, styleOptions.mono);
}

export function boxShadowStyle(styleOptions: StyleOption) {
    return getStyleClass('bs', styleOptions.style, styleOptions.mode, styleOptions.mono);
}

export function textShadowStyle(styleOptions: StyleOption) {
    return getStyleClass('ts', styleOptions.style, styleOptions.mode, styleOptions.mono);
}
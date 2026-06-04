interface Overrides {
    coloring?: string;
    interactive?: string;
    layout?: string;
    styling?: string;
    themes?: string;
}

const PACKAGE_NAME = '@syren-dev-tech/confetti';

// eslint-disable-next-line complexity
export function viteConfigAliases(overrides?: Overrides) {
    return {
        [overrides?.coloring ?? '~coloring']: PACKAGE_NAME + '/_coloring.scss',
        [overrides?.interactive ?? '~interactive']: PACKAGE_NAME + '/_interactive.scss',
        [overrides?.layout ?? '~layout']: PACKAGE_NAME + '/_layout.scss',
        [overrides?.styling ?? '~styling']: PACKAGE_NAME + '/_styling.scss',
        [overrides?.themes ?? '~themes']: PACKAGE_NAME + '/_themes.scss'
    };
}
# SCSS Rigging

**Dev Dependencies**

[![GitHub Logo](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dead-harbour/shipshape)
![GitHub package.json dev/peer/optional dependency version (branch)](https://img.shields.io/github/package-json/dependency-version/dead-harbour/scss-rigging/dev/%40dead-harbour%2Fshipshape/master)

***

Why does this "package" exist?

Basically, I'm tired of writing the same set of preset styles over and over.

So, here we are - a collection of SCSS stylesheets for everyday styles.

## Styling

Styling comes in 2 primary categories:

1. SCSS mixins and functions to help style layouts and components
2. Theme definitions

To include theme definitions, your "root" SCSS file should include something like:

```scss
@use '~themes' as themes;
@use '@dead-harbour/scss-rigging/main.scss';

// Specify themes to use with a list like:
// ---
// @include themes.use-themes(('tea-light', 'tea-dark'));
// ---

@include themes.apply();
```

... and your `index.html` file, or whatever defines your `body`, should use:

```html
<body class="theme">
```

Because I wrote this with Vite in mind, configuration of SCSS imports can be done with a simple "merge-in" config `viteConfigAliases()`.

```ts
import { viteConfigAliases } from '@dead-harbour/scss-rigging/config';

// vite.config.ts

export default defineConfig({
    // ...
    resolve: {
        alias: {
            ...viteConfigAliases()
        }
    }
    // ...
})
```

This takes an optional "overrides" argument that lets you define SCSS import aliases.

For example, by default, the "layouts" related mixins and functions use `~layout` and can be imported like `@use '~layout' as layout;`.
With the override `{layout: '~bungus'}`, you can import instead like `@use '~bungus' as bungus`.
Alternatively, you can use the full path: `@dead-harbour/scss-rigging/_layout.scss`.

## Themes

Themes are managed with a `ThemeManager` instance.

Themes can be implemented using a `ThemeProvider` from [`@dead-harbour/react-elements`](https://github.com/dead-harbour/react-elements) like the following:

```tsx
// main.tsx

<ThemeProvider>
    <App />
</ThemeProvider>
```

Themes can be switched using browser scheme (dark / light) or the context setters `setTheme` and `setScheme`.
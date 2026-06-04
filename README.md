# SCSS Rigging

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

@include themes.themeify();
```

... and your `index.html` file, or whatever defines your `body`, should use:

```html
<body class="theme f-body">
```

Because I wrote this with Vite in mind, configuration of SCSS imports can be done with a simple "merge-in" config `viteConfigAliases()`.

```ts
// vite.config.ts

export default defineConfig({
    // ...
    resolve: {
        alias: {
            ...viteConfigAliases()
        }
    },
    // If you are using Vite 5 or older, you may need to use the "modern compiler" API option:
    ...viteConfigScss()
    // This just defines css.preprocessorOptions.scss.api = 'modern-compiler'
    // If you are using other configurations there, define it manually instead.
    // This is just the "quick and easy" way I do it for all my projects.
})
```

This takes an optional "overrides" argument that lets you define SCSS import aliases.

For example, by default, the "layouts" related mixins and functions use `~layout` and can be imported like `@use '~layout' as layout;`.
With the override `{layout: '~bungus'}`, you can import instead like `@use '~bungus' as bungus`.
Alternatively, you can use the full path: `@dead-harbour/scss-rigging/_layout.scss`.

## Themes

Themes are implemented like the following:

```tsx
// App.tsx

import { themes } from '@dead-harbour/scss-rigging/themes';
import { useEffect } from 'react';

function App() {
    useEffect(() => {themes.init();}, []);

    return // ...
}
```

> I recommend using my [React Elements package](https://github.com/Dead-Harbour/react-elements) to implement theme switching.

You can implement a basic theme selector and listener for media color scheme (light / dark mode) changes using:

```tsx
// Inside your selector component, like a button:

const [theme, setTheme] = useState(themes.getTheme());
const [colorScheme, setColorScheme] = useState(themes.getColorScheme());

// You can use an effect to create listeners for theme related changes:
useEffect(() => {
    // t = theme, c = color scheme
    themes.addListener(id, (t, c) => {
        setTheme(t)
        setColorScheme(c);
    })

    return () => {
        themes.removeListener(id);
    }
}, []);

// For changing dark / light mode:
<button
    onClick={() => themes.setColorScheme(colorScheme === 'dark' && 'light' || 'dark')}
>
    <span>
        {colorScheme}
    </span>
</button>

// To set a different theme:
<button
    onClick={() => themes.setTheme('tea')} // See: `THEMES` in lib/themes.ts
>
    Use Tea theme
</button>
```
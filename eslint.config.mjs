// @ts-check

import { reactViteConfig, typescriptConfig } from '@syren-dev-tech/concauses/eslint';

export default [...typescriptConfig(), ...reactViteConfig()];
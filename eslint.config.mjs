// @ts-check

import { reactViteConfig, typescriptConfig } from '@dead-harbour/shipshape/eslint';

export default [...typescriptConfig(), ...reactViteConfig()];
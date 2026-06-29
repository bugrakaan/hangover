/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  viteFinal: (config) => ({
    ...config,
    base: process.env.STORYBOOK_BASE_URL || config.base,
  }),
}

export default config

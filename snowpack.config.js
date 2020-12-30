/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public : { url: '/', static: true },
    src    : { url: '/dist/src' },
    games  : { url: '/dist/games' },
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
  ],
  install: [
    'jquery',
    'jquery-ui',
    'lodash',
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  alias: {
    /* ... */
  },
};

export default {
  pagesDir: 'src/duct/pages',
  layoutsDir: 'src/duct/layouts',
  env: {
    SITE_NAME: 'Fourdle',
    SITE_URL: 'http://localhost:3001',
  },
  nunjucks: {
    options: {
      autoescape: true,
      throwOnUndefined: false,
    },
  },
  globals: {
    currentYear: new Date().getFullYear(),
    site: {
      name: 'Fourdle',
      tagline: '4 * wordle',
      url: 'http://localhost:3001',
    },
  },
}

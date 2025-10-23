/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://syntance.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/server-sitemap.xml',
    '/404'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: '/api/',
      }
    ],
    additionalSitemaps: [
      'https://syntance.com/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Ustaw priorytety dla konkretnych stron
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    if (path === '/studio') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Domyślna konfiguracja dla pozostałych stron
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

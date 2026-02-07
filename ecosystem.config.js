/* global module */
module.exports = {
  apps: [
    {
      name: 'cicero_v2',
      script: 'app.js',
      instances: 1, // CRITICAL: Only run one instance to prevent Telegram 409 conflicts
      exec_mode: 'fork', // Use fork mode (not cluster) for single instance
      env: {
        WA_SERVICE_SKIP_INIT: 'false'
      },
      env_production: {
        WA_SERVICE_SKIP_INIT: 'false'
      },
      watch: process.env.NODE_ENV === 'production' ? false : ['app.js', 'src'],
      ignore_watch: [
        'laphar',
        'logs',
        'uploads',
        'backups',
        '*.txt',
        '*.csv',
        '*.tsv',
        '*.log',
        '*.json',
        '*.xlsx',
        '*.xls',
        '*.zip'
      ],
      max_restarts: 10, // Limit restarts to prevent infinite restart loops
      min_uptime: '10s' // Minimum uptime before considering the app as started
    }
  ]
};

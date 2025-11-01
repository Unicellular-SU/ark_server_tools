module.exports = {
  apps: [
    {
      name: 'ark-web-manager',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ARK_TOOLS_PATH: 'arkmanager',
        ARK_SERVERS_PATH: '/home/steam/ARK',
        CLUSTER_DATA_PATH: '/home/steam/cluster'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      // Auto-restart configuration
      watch: false,
      max_memory_restart: '1G',
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Cluster configuration
      instance_var: 'INSTANCE_ID',
    }
  ],

  deploy: {
    production: {
      user: 'steam',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-repo/ark-server-manager.git',
      path: '/home/steam/ark-web-manager',
      'pre-deploy': 'git pull',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}


# ARK Server Manager

A modern web-based management interface for ARK: Survival Evolved dedicated servers, built with Next.js 15 and integrated with ark-server-tools.

![ARK Server Manager](https://img.shields.io/badge/ARK-Server%20Manager-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### 🎮 Server Management
- **Multi-instance Support**: Manage multiple ARK server instances from a single interface
- **One-Click Operations**: Start, stop, and restart servers with confirmation dialogs
- **Server Installation**: Easy wizard for installing new server instances
- **Update Management**: Check for and apply server updates
- **Real-time Status**: Live server status monitoring with SSE (Server-Sent Events)

### 📊 Dashboard & Monitoring
- **Live Metrics**: Real-time CPU and memory usage monitoring
- **Player Tracking**: View online players and connection statistics
- **Resource Visualization**: Progress bars and charts for system resources
- **Server Overview**: Quick status cards for all server instances

### ⚙️ Configuration Management
- **Graphical Interface**: Edit server settings without touching config files
- **Organized Settings**: Basic, Gameplay, and Advanced configuration tabs
- **Validation**: Built-in configuration validation to prevent errors
- **Raw Editor**: Advanced JSON editor for power users
- **Cluster Configuration**: Easy setup for server clustering and cross-transfers

### 🎯 RCON Management
- **Terminal Interface**: Terminal-like RCON console with command history
- **Quick Commands**: One-click buttons for common operations
  - Broadcast messages
  - Save world
  - Kick/ban players
  - Destroy wild dinos
  - Set time of day
  - List players
- **Real-time Execution**: Instant command execution and response display

### 📝 Log Viewer
- **Live Streaming**: Real-time log streaming via SSE
- **Pause/Resume**: Control log flow for easier reading
- **Auto-scroll**: Automatic scrolling to latest entries
- **Clear History**: Clean up log display

### 🌐 Cluster Support
- **Multi-server Clustering**: Configure cluster ID and shared directories
- **Server Selection**: Visual interface for selecting cluster members
- **Cross-server Chat**: Optional cross-server chat configuration

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Lucide Icons** - Beautiful icon set

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **ark-server-tools** - Server management via shell commands
- **simple-rcon** - RCON protocol implementation
- **systeminformation** - System metrics collection
- **ini** - Configuration file parsing

### Deployment
- **Docker** - Containerized deployment
- **PM2** - Process management with cluster mode
- **Node.js 20** - Runtime environment

## Prerequisites

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: v20 or higher
- **ark-server-tools**: Installed and configured ([Installation Guide](https://github.com/arkmanager/ark-server-tools))
- **ARK Server**: At least one ARK server instance configured
- **PM2** (optional): For production deployment without Docker

## Installation

### Method 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/your-repo/ark-server-manager.git
cd ark-server-manager
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

3. Update volume paths in `docker-compose.yml`:
```yaml
volumes:
  - /etc/arkmanager:/etc/arkmanager:ro
  - /home/steam/ARK:/ark-servers:rw
  - /home/steam/cluster:/cluster:rw
```

4. Build and run with Docker Compose:
```bash
docker-compose up -d
```

5. Access the web interface at `http://your-server:3000`

### Method 2: PM2 (Production)

1. Clone and install dependencies:
```bash
git clone https://github.com/your-repo/ark-server-manager.git
cd ark-server-manager
npm install
```

2. Build the application:
```bash
npm run build
```

3. Configure PM2 ecosystem file:
```bash
# Edit ecosystem.config.js with your paths
nano ecosystem.config.js
```

4. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Method 3: Development

1. Clone and install:
```bash
git clone https://github.com/your-repo/ark-server-manager.git
cd ark-server-manager
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open `http://localhost:3000`

## Configuration

详细配置说明请参考 [CONFIGURATION.md](CONFIGURATION.md)

### Environment Variables

Create a `.env` file in the project root:

```bash
# ARK Server Tools Configuration
ARK_TOOLS_PATH=arkmanager                           # Path to arkmanager binary
ARK_SERVERS_PATH=/home/steam/ARK                    # ARK servers installation path
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances  # Instance config directory
CLUSTER_DATA_PATH=/home/steam/cluster               # Cluster shared data path

# Application
NODE_ENV=production
PORT=3000
```

### 重要配置说明

根据 ark-server-tools 官方文档，默认端口配置为：
- **游戏端口 (Port)**: 7778 (UDP)
- **查询端口 (QueryPort)**: 27015 (UDP)
- **RCON 端口 (RCONPort)**: 32330 (TCP)

每个服务器实例必须有独立的端口配置。

### ark-server-tools Integration

本项目已根据 [ark-server-tools 官方文档](https://github.com/arkmanager/ark-server-tools) 进行配置。

1. Install ark-server-tools:
```bash
curl -sL https://raw.githubusercontent.com/arkmanager/ark-server-tools/master/netinstall.sh | sudo bash -s steam
```

2. Create instance configuration in `/etc/arkmanager/instances/<instance>.cfg`:
```bash
arkserverroot="/home/steam/ARK"
serverMap="TheIsland"
ark_RCONEnabled="True"
ark_RCONPort="32330"
ark_Port="7778"
ark_QueryPort="27015"
ark_ServerAdminPassword="your-password"
ark_SessionName="My ARK Server"
ark_MaxPlayers="70"
```

3. Test arkmanager commands:
```bash
arkmanager status
arkmanager list-instances
```

详细配置说明请参考 [CONFIGURATION.md](CONFIGURATION.md)

### RCON Configuration

For RCON functionality, ensure your server instances have RCON enabled in their configuration:

```ini
# In GameUserSettings.ini
[ServerSettings]
RCONEnabled=True
RCONPort=27020
ServerAdminPassword=your-admin-password
```

## Usage

### Dashboard
Navigate to the dashboard to see an overview of all server instances with real-time metrics and quick action buttons.

### Server Management
1. Go to **Servers** page
2. Click **Install New Server** to add instances
3. Use action buttons to start/stop/restart servers
4. Click **Configure** to edit server settings
5. Click **Update** to check for and apply updates

### Configuration
1. Navigate to **Configuration**
2. Select a server instance
3. Use tabs to edit different setting categories:
   - **Basic**: Server name, passwords, max players
   - **Gameplay**: Multipliers and difficulty
   - **Advanced**: Raw JSON configuration
4. Click **Save Configuration**

### Cluster Setup
1. Go to **Cluster** page
2. Enter Cluster ID and Directory
3. Select server instances to include
4. Enable cross-server chat if desired
5. Save configuration

### RCON Console
1. Navigate to **RCON** page
2. Select a running server instance
3. Use quick command buttons or type commands in the terminal
4. View command history and responses

### Log Viewer
1. Go to **Logs** page
2. Select a server instance
3. View real-time logs
4. Use **Pause** to freeze log stream
5. Use **Clear** to clean up display

## Project Structure

```
ark-server-manager/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── servers/          # Server management endpoints
│   │   ├── rcon/             # RCON endpoints
│   │   ├── config/           # Configuration endpoints
│   │   ├── logs/             # Log streaming
│   │   ├── cluster/          # Cluster configuration
│   │   └── events/           # SSE event stream
│   ├── dashboard/            # Dashboard page
│   ├── servers/              # Server management page
│   ├── config/               # Configuration pages
│   ├── cluster/              # Cluster config page
│   ├── rcon/                 # RCON management page
│   ├── logs/                 # Log viewer page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                  # shadcn/ui components
│   ├── common/              # Shared components
│   ├── dashboard/           # Dashboard components
│   ├── servers/             # Server management components
│   └── rcon/                # RCON components
├── lib/                     # Utility libraries
│   ├── ark-manager.ts      # ark-server-tools wrapper
│   ├── rcon-client.ts      # RCON client manager
│   ├── system-monitor.ts   # System metrics collector
│   ├── config-manager.ts   # Config file handler
│   └── utils.ts            # Utility functions
├── types/                   # TypeScript type definitions
│   └── ark.d.ts
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── ecosystem.config.js     # PM2 configuration
└── README.md               # This file
```

## API Endpoints

### Server Management
- `GET /api/servers` - List all server instances
- `GET /api/servers/[instance]` - Get instance status
- `POST /api/servers/[instance]` - Start server
- `PUT /api/servers/[instance]` - Restart server
- `DELETE /api/servers/[instance]` - Stop server
- `POST /api/servers/[instance]/install` - Install server
- `PUT /api/servers/[instance]/install` - Update server
- `GET /api/servers/[instance]/install` - Check for updates

### Configuration
- `GET /api/servers/[instance]/config` - Read configuration
- `POST /api/servers/[instance]/config` - Save configuration

### RCON
- `POST /api/rcon/[instance]` - Execute RCON command
- `GET /api/rcon/[instance]` - Get command history
- `DELETE /api/rcon/[instance]` - Disconnect RCON

### Monitoring
- `GET /api/events` - SSE stream for real-time updates
- `GET /api/logs/[instance]` - SSE stream for server logs

### Cluster
- `GET /api/cluster` - Get cluster configuration
- `POST /api/cluster` - Save cluster configuration

## Troubleshooting

### Web Interface Not Accessible
- Check if the service is running: `docker ps` or `pm2 status`
- Verify firewall rules allow port 3000
- Check logs: `docker logs ark-web-manager` or `pm2 logs`

### arkmanager Commands Not Working
- Verify ark-server-tools is installed: `which arkmanager`
- Check permissions: Container must have access to arkmanager
- Test manually: `docker exec ark-web-manager arkmanager status`

### RCON Connection Failures
- Verify RCON is enabled in server configuration
- Check RCON port is correct
- Verify admin password matches
- Ensure server is running

### Server Not Starting
- Check arkmanager logs: `arkmanager status @instance`
- Verify server files are installed
- Check disk space and permissions
- Review server logs in the Logs page

## Security Considerations

### Authentication
This application currently has no built-in authentication. It is recommended to:
- Deploy behind a reverse proxy with authentication (nginx, Apache)
- Use a VPN for remote access
- Configure firewall rules to restrict access

### RCON Security
- Use strong admin passwords
- Limit RCON port exposure
- Use firewalls to restrict RCON access

### File Permissions
- Ensure proper file ownership for server files
- Use read-only mounts where appropriate
- Run containers with appropriate user permissions

## Performance Optimization

### Production Deployment
- Use PM2 cluster mode to utilize multiple CPU cores
- Enable Next.js output: standalone in `next.config.js`
- Configure proper cache headers
- Use a CDN for static assets

### System Resources
- Monitor server resource usage in the dashboard
- Adjust PM2 max_memory_restart based on your system
- Configure appropriate Docker resource limits

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ark-server-tools](https://github.com/arkmanager/ark-server-tools) - Server management scripts
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- ARK: Survival Evolved community

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## Changelog

### Version 1.0.0
- Initial release
- Dashboard with real-time monitoring
- Server management (start/stop/restart/install/update)
- Configuration management
- RCON console
- Log viewer
- Cluster configuration
- Docker and PM2 deployment support


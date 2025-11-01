# Changelog

## [1.0.0] - 2025-11-01

### Added - Core Features
- ✅ Dashboard with real-time server monitoring (SSE)
- ✅ Server management (start/stop/restart/install/update)
- ✅ Configuration management via instance .cfg files
- ✅ RCON console with command history
- ✅ Real-time log viewer with SSE
- ✅ Cluster configuration for cross-server transfers
- ✅ **Mod management system** (install/uninstall/update check)
- ✅ Responsive UI with shadcn/ui components

### Added - Configuration Features
- ✅ Port configuration with uniqueness warnings
- ✅ Auto-update on server start option
- ✅ Backup before update option
- ✅ Always restart on crash option
- ✅ Mod ID configuration in Gameplay tab
- ✅ Special character warnings for session names
- ✅ Configuration validation with detailed errors

### Added - Status Management
- ✅ Four-state server status (stopped/starting/running/stopping)
- ✅ Two-phase starting detection
- ✅ Accurate player count extraction
- ✅ Server version display
- ✅ PID tracking
- ✅ Status animations (spinning icons)

### Added - Documentation
- ✅ README.md - Complete project documentation
- ✅ CONFIGURATION.md - Detailed configuration guide
- ✅ CONFIG_UPDATE_GUIDE.md - Configuration update workflow
- ✅ STATUS_PARSING.md - Status parsing explanation
- ✅ QUICK_REFERENCE.md - Quick reference guide
- ✅ ADVANCED_FEATURES.md - Advanced features guide
- ✅ VERIFICATION_CHECKLIST.md - Testing checklist
- ✅ FIXES.md - Bug fix log
- ✅ SUMMARY.md - Project summary
- ✅ CHANGELOG.md - This file

### Fixed - Configuration Issues
- ✅ Config file comment parsing (removed inline comments)
- ✅ Quote handling in bash-style config files
- ✅ Configuration now saves to .cfg files (not GameUserSettings.ini)
- ✅ Configuration persistence across server restarts
- ✅ Path resolution with proper comment removal

### Fixed - Status Detection
- ✅ Accurate "Server running: Yes/No" parsing
- ✅ Accurate "Server listening: Yes/No" parsing
- ✅ Starting state detection (process running but not listening)
- ✅ Starting state detection (listening but not queryable)
- ✅ Player count extraction from "Steam Players: X / Y"
- ✅ PID extraction from "Server PID: XXXXX"

### Fixed - Next.js 15 Compatibility
- ✅ All dynamic route params use async/await
- ✅ Removed deprecated swcMinify configuration
- ✅ Added "use client" directives to client components
- ✅ Fixed useToast hook in server component error

### Fixed - Dependencies
- ✅ systeminformation osx-temperature-sensor warning
- ✅ simple-rcon version compatibility
- ✅ webpack configuration for optional dependencies

### Changed - arkmanager Integration
- ✅ Default ports match ark-server-tools (RCON: 32330, Port: 7778)
- ✅ Use correct arkmanager commands (broadcast, saveworld vs rconcmd)
- ✅ Read configuration from /etc/arkmanager/instances/*.cfg
- ✅ Support environment variables for paths

### Technical Implementation
- ✅ Server-Sent Events (SSE) for real-time updates
- ✅ PM2 cluster mode support
- ✅ Docker containerization with multi-stage build
- ✅ TypeScript with comprehensive type definitions
- ✅ shadcn/ui component library integration
- ✅ Responsive layout with Tailwind CSS

### API Endpoints
- Server Management: 8 endpoints
- Configuration: 2 endpoints
- RCON: 3 endpoints
- Logs & Events: 2 SSE endpoints
- Cluster: 2 endpoints
- Mods: 4 endpoints (NEW)
- **Total: 21 API endpoints**

### Security Features
- ✅ Configuration validation
- ✅ Port range validation
- ✅ Special character detection in session names
- ✅ Confirmation dialogs for destructive operations
- ✅ Error handling with user-friendly messages

### Performance Features
- ✅ Real-time updates without polling
- ✅ Efficient SSE implementation
- ✅ Optimized Docker image (multi-stage build)
- ✅ PM2 cluster mode for multi-core utilization
- ✅ Standalone Next.js output

### Known Limitations
- No built-in authentication (deploy behind reverse proxy)
- Mod updates require manual trigger
- Log streaming limited to recent entries
- Port conflict detection is manual

### Future Enhancements (Not in v1.0)
- Automated port conflict detection
- Backup/restore UI
- Scheduled tasks (auto-restart, auto-backup)
- Discord webhook integration
- Multi-language support
- User authentication system
- Historical metrics and charts
- Mod auto-update scheduling

---

## Installation Changes

### Environment Variables
```bash
# Required
ARK_TOOLS_PATH=arkmanager
ARK_SERVERS_PATH=/home/steam/ARK
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances
CLUSTER_DATA_PATH=/home/steam/cluster

# Optional
PORT=3000
NODE_ENV=production
```

### Dependencies
```json
{
  "simple-rcon": "^0.3.1",
  "systeminformation": "^5.23.5",
  "node-os-utils": "^1.3.7",
  "ini": "^5.0.0",
  "next": "^15.0.2",
  "react": "^18.3.1",
  "typescript": "^5.6.3"
}
```

---

## Migration Guide

If upgrading from an earlier version:

1. **Backup your data**
   ```bash
   arkmanager backup @all
   ```

2. **Update dependencies**
   ```bash
   npm install
   ```

3. **Update environment variables**
   - Add `ARK_INSTANCE_CONFIG_DIR` to `.env`

4. **Verify configuration**
   - Configuration now reads/writes to `.cfg` files
   - Check that your instances are properly configured

5. **Restart the application**
   ```bash
   npm run build
   pm2 restart ark-web-manager
   ```

---

## Credits

- ark-server-tools by arkmanager team
- Next.js by Vercel
- shadcn/ui components
- ARK: Survival Evolved community

## Support

For issues specific to:
- **Web UI**: Open issue on this project
- **ark-server-tools**: Visit https://github.com/arkmanager/ark-server-tools
- **ARK Server**: Visit ARK official forums

---

Version 1.0.0 - Complete implementation with all core features and advanced functionality!


# Task Dashboard 🤖

A web-based task manager and communication hub for human-AI collaboration. Built with Node.js, Express, and vanilla HTML/CSS/JS.

## Features

- 📊 **Dashboard** - Overview of tasks with stats (total, completed, pending, high priority)
- 📝 **Task Management** - Add, complete, and delete tasks with priority levels
- 💬 **Messaging** - Leave notes for your AI assistant
- 📱 **Mobile-friendly** - Works on desktop and mobile browsers
- 🔗 **Telegram Integration** - Get instant notifications when new tasks are added
- 🌐 **Public Access** - Can be exposed via tunneling (ngrok, Cloudflare Tunnel)

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm start
```

Visit http://localhost:3000

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token (for notifications) |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID to receive notifications |

Example:
```bash
TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=xxx node server.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Add new task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/messages` | Get all messages |
| POST | `/api/messages` | Add new message |
| GET | `/api/stats` | Get dashboard stats |

## Access Remotely

### Option 1: Cloudflare Quick Tunnel (Free, no signup)
```bash
# Install cloudflared
curl -sL https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip -o ngrok.zip
# Or download from https://github.com/cloudflare/cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:3000
```

### Option 2: ngrok
```bash
ngrok http 3000
```

### Option 3: Port Forwarding (Router)
Forward port 3000 to your server's local IP.

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: JSON file (tasks.json)
- **Notifications**: Telegram Bot API

## License

MIT

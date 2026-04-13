# Go Runtime Setup Guide

This guide helps operators verify and install the Go runtime before using the go-dev skill.
Run the check first — only follow the steps if the check fails.

## 1. Go Runtime

### Check
```bash
go version 2>/dev/null && echo "OK"
```

### Steps

**Linux (amd64):**
```bash
GO_VERSION=$(curl -s 'https://go.dev/dl/?mode=json' | grep -o '"version":"go[^"]*"' | head -1 | cut -d'"' -f4)
curl -fsSL "https://go.dev/dl/${GO_VERSION}.linux-amd64.tar.gz" -o /tmp/go.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf /tmp/go.tar.gz
rm /tmp/go.tar.gz
```

**Linux (arm64):**
```bash
GO_VERSION=$(curl -s 'https://go.dev/dl/?mode=json' | grep -o '"version":"go[^"]*"' | head -1 | cut -d'"' -f4)
curl -fsSL "https://go.dev/dl/${GO_VERSION}.linux-arm64.tar.gz" -o /tmp/go.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf /tmp/go.tar.gz
rm /tmp/go.tar.gz
```

**macOS:**
```bash
brew install go
```

**Windows:**
```powershell
winget install GoLang.Go
```
Or download the MSI installer from https://go.dev/dl/ and run it.

## 2. PATH Configuration

After installing Go, ensure it is available in your shell PATH.

### Check
```bash
which go 2>/dev/null && echo "OK"
```

### Steps

**Linux (tarball install):**

Add to `~/.profile` or `~/.bashrc`:
```bash
export PATH=/usr/local/go/bin:$PATH
```
Then reload:
```bash
source ~/.profile
```

**macOS (Homebrew):**

Homebrew automatically links `go` into `/opt/homebrew/bin` (Apple Silicon) or `/usr/local/bin` (Intel), which should already be in PATH. No action needed.

**Windows:**

The installer and `winget` add Go to the system PATH automatically. Restart your terminal if `go version` does not work after install.

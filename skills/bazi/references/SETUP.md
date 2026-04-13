# BaZi Setup Guide

This guide helps operators verify and install prerequisites before using the bazi skill.
Run checks in order — each step depends on the previous one.

## 1. Python 3.8+

### Check
```bash
python3 --version 2>/dev/null && echo "OK"
```

### Steps

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update && sudo apt-get install -y python3 python3-pip
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install -y python3 python3-pip
```

**macOS:**
```bash
brew install python
```

**Windows:**
```powershell
winget install Python.Python.3.12
```
Or download from https://www.python.org/downloads/ and run the installer (check "Add to PATH").

## 2. Python Packages

lunar-python, colorama, and bidict are required for calendar calculations and output formatting.

### Check
```bash
python3 -c "import lunar_python, colorama, bidict" 2>/dev/null && echo "OK"
```

### Steps
```bash
pip3 install lunar-python colorama bidict
```

If your system uses externally managed Python (Debian 12+, Ubuntu 23.04+):
```bash
pip3 install lunar-python colorama bidict --break-system-packages
```

## 3. Git

Required for cloning the bazi calculation engine on first run.

### Check
```bash
git --version 2>/dev/null && echo "OK"
```

### Steps

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update && sudo apt-get install -y git
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install -y git
```

**macOS:**
```bash
brew install git
```

**Windows:**
```powershell
winget install Git.Git
```

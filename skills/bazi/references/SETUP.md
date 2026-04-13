# BaZi Setup Guide

This guide helps operators verify and install prerequisites before using the bazi skill.
Run checks in order — each step depends on the previous one.

## 1. Python 3.8+

### Check

**Linux / macOS:**
```bash
python3 --version 2>/dev/null && echo "OK"
```

**Windows:**
```powershell
python --version 2>$null; if ($?) { echo "OK" }
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
winget install Python.Python.3
```
Or download from https://www.python.org/downloads/ and run the installer (check "Add to PATH").

> **Note:** On Windows, use `python` and `pip` instead of `python3` and `pip3` in all commands below.

## 2. Python Packages

lunar-python, colorama, and bidict are required for calendar calculations and output formatting.

### Check

**Linux / macOS:**
```bash
python3 -c "import lunar_python, colorama, bidict" 2>/dev/null && echo "OK"
```

**Windows:**
```powershell
python -c "import lunar_python, colorama, bidict" 2>$null; if ($?) { echo "OK" }
```

### Steps

```bash
pip3 install lunar-python colorama bidict
```

**Linux (Debian 12+ / Ubuntu 23.04+):** If your system uses externally managed Python:
```bash
pip3 install lunar-python colorama bidict --break-system-packages
```

**Windows:**
```powershell
pip install lunar-python colorama bidict
```

## 3. Git

Required for cloning the bazi calculation engine on first run.

### Check

**Linux / macOS:**
```bash
git --version 2>/dev/null && echo "OK"
```

**Windows:**
```powershell
git --version 2>$null; if ($?) { echo "OK" }
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

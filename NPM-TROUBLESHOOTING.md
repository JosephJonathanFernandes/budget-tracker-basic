# NPM Troubleshooting Guide

## Quick Fixes (Try in Order)

### Fix 1: Basic Reset

```bash
npm cache clean --force
npm install
```

### Fix 2: Full Clean Install

```bash
# Delete these:
rm -rf node_modules package-lock.json

# Reinstall:
npm install
```

### Fix 3: Update npm

```bash
npm install -g npm@latest
```

### Fix 4: Check Node Version

```bash
node --version  # Should be 16+ for modern projects
npm --version   # Should be 8+
```

## Common React Errors & Fixes

### "Module not found"

```bash
npm install
# or install specific package:
npm install react react-dom
```

### "Cannot find module 'react-scripts'"

```bash
npm install react-scripts --save
```

### "Port 3000 already in use"

```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change port:
# Create .env file with: PORT=3001
```

### "EACCES permission denied"

```bash
# Windows: Run PowerShell as Administrator
# Or fix npm permissions:
npm config set prefix %APPDATA%\npm
```

### "Package-lock.json conflict"

```bash
rm package-lock.json
npm install
```

## Best Practices to Avoid Errors

1. **Always run commands from project folder**

   ```bash
   cd your-project
   npm install
   ```

2. **Don't manually edit node_modules**
   - Always use npm install/uninstall

3. **Commit package-lock.json to git**
   - Ensures consistent versions

4. **Use specific versions in package.json**

   ```json
   "react": "18.2.0"  // ✅ Specific
   "react": "^18.2.0" // ⚠️ May update
   ```

5. **Check .gitignore includes:**
   ```
   node_modules/
   .env
   ```

## Emergency Commands

```bash
# Nuclear option - clean everything:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Fix permission issues (Windows):
npm config set prefix %APPDATA%\npm

# Clear npm cache location:
npm config get cache
# Then manually delete that folder

# Verify installation:
npm list
npm doctor
```

## For This Project Specifically

```bash
# From the budget_tracker folder:
cd C:\Users\Joseph\Desktop\projects\js_projects\budget_tracker

# Then run:
node server.js
```

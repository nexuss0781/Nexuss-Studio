# InfinityFree Deployment Guide

## 🚀 Quick Start for InfinityFree

### Step 1: Upload Files
1. Login to your InfinityFree account
2. Go to File Manager (htdocs folder)
3. Upload ALL files from this repository to `htdocs/`

### Step 2: Verify .htaccess
Ensure `.htaccess` file is uploaded (it's hidden by default in some FTP clients)
- Enable "Show Hidden Files" in your FTP client
- The `.htaccess` file is critical for preventing 403 errors

### Step 3: Set Permissions
In File Manager, ensure these folders have 755 permissions:
- `/projects/`
- `/history/`
- `/cache/`
- `/temp/`
- `/logs/`

### Step 4: Access Your App
Visit: `http://your-domain.infinityfreeapp.com/`

## 🔧 Troubleshooting 403 Errors

### Common Causes & Solutions:

#### 1. Missing .htaccess
**Solution:** Ensure `.htaccess` is uploaded to the root directory

#### 2. Wrong PHP Version
**Solution:** 
- Go to Control Panel → PHP Configuration
- Select PHP 7.4 or PHP 8.0/8.1

#### 3. Directory Index Issue
**Solution:** The `.htaccess` already sets `DirectoryIndex index.php index.html`

#### 4. Mod_Rewrite Not Enabled
**Solution:** InfinityFree has mod_rewrite enabled by default

#### 5. File Permissions
**Solution:** Set all folders to 755, files to 644

#### 6. Error Display Disabled
The app now has `display_errors = 0` for production
Check error logs in `/logs/` folder

## 📁 Required Folder Structure
```
htdocs/
├── .htaccess          ← CRITICAL!
├── index.php
├── templates/
│   └── index.html
├── src/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── chat.js
│       ├── study-mode.js
│       ├── coding-mode.js
│       ├── cache.js
│       └── api.js
├── projects/          ← Auto-created
├── history/           ← Auto-created
├── cache/             ← Auto-created
├── temp/              ← Auto-created
├── logs/              ← Auto-created
└── system_prompts/
    ├── chat-assistant.md
    └── workspace-assistant.md
```

## ⚙️ InfinityFree Limitations

| Feature | Limit |
|---------|-------|
| Disk Space | 5GB |
| Bandwidth | Unlimited* |
| PHP Memory | 256MB |
| Max Execution Time | 30 seconds |
| Database | 3 MySQL databases |
| File Size Upload | 10MB max |

*Fair usage policy applies

## 🔐 Security Notes

- All sensitive files are protected via `.htaccess`
- Error display is disabled in production
- CORS headers are configured
- XSS protection headers enabled
- Directory listing disabled

## 📝 Testing Checklist

- [ ] Homepage loads without 403
- [ ] CSS/JS files load correctly
- [ ] Chat functionality works
- [ ] PDF upload works (Study Mode)
- [ ] File operations work (Coding Mode)
- [ ] Projects save correctly
- [ ] History is recorded

## 🆘 Support

If you still get 403 errors:
1. Check browser console for specific errors
2. Review `/logs/error.log` if accessible
3. Contact InfinityFree support with error details
4. Verify `.htaccess` content matches this repository

## 🔄 Updating

To update your deployment:
1. Download new version from GitHub
2. Upload changed files via FTP
3. Clear browser cache (Ctrl+F5)
4. Test all features

---

**Nexus Studio v1.0.0** - Built for InfinityFree

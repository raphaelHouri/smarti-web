# PWA Install Prompt Guide

## Why the Install Prompt Might Not Appear

The PWA install prompt may not appear automatically for several reasons:

### 1. **Development Mode**

By default, PWA is **disabled in development mode** to prevent issues during development.

**Solution:**

- Test in production mode: `npm run build && npm start`
- Or enable PWA in development: Set `ENABLE_PWA=true` environment variable

### 2. **HTTPS Requirement**

PWAs require HTTPS (except for `localhost`). If you're testing on a network IP or non-localhost domain, you need HTTPS.

**Solution:**

- Use `localhost` for local testing
- Use HTTPS in production
- For local network testing, use a tool like `ngrok` to create an HTTPS tunnel

### 3. **Service Worker Not Registered**

The service worker must be registered for the install prompt to appear.

**Check:**

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** section
4. Verify a service worker is registered and active

### 4. **Browser Support**

Not all browsers support the install prompt:

- ✅ **Chrome/Edge** (Desktop & Android) - Full support
- ✅ **Safari** (iOS 11.3+) - Limited support (Add to Home Screen)
- ❌ **Firefox** - No install prompt (but can be installed manually)

### 5. **Already Installed**

If the app is already installed, the prompt won't appear.

**Check:**

- Look for the app icon on your device/desktop
- Check if running in standalone mode

### 6. **User Engagement**

Browsers require user interaction before showing the install prompt. The prompt typically appears after:

- User has visited the site multiple times
- User has interacted with the site
- User has been on the site for a certain duration

## How to Test the Install Prompt

### Method 1: Production Build (Recommended)

```bash
# Build the app
npm run build

# Start production server
npm start

# Open in browser
# Visit http://localhost:3000
```

### Method 2: Enable PWA in Development

```bash
# Set environment variable
export ENABLE_PWA=true  # Linux/Mac
set ENABLE_PWA=true     # Windows CMD
$env:ENABLE_PWA="true"  # Windows PowerShell

# Start dev server
npm run dev
```

### Method 3: Manual Install Button

The app now includes a custom install button component (`PWAInstallPrompt`) that will appear when:

- The browser supports installation
- The service worker is registered
- The app is not already installed

This button will appear automatically when conditions are met.

## Testing Checklist

- [ ] Build the app in production mode
- [ ] Verify service worker is registered (DevTools > Application > Service Workers)
- [ ] Verify manifest.json is accessible at `/manifest.json`
- [ ] Verify all icons exist in `/public/` directory
- [ ] Test on Chrome/Edge (desktop or Android)
- [ ] Check browser console for errors
- [ ] Verify HTTPS (if not on localhost)

## Manual Installation (If Prompt Doesn't Appear)

### Chrome/Edge (Desktop)

1. Click the **install icon** in the address bar (if available)
2. Or go to **Menu** (⋮) > **Install [App Name]**

### Chrome (Android)

1. Tap **Menu** (⋮) > **Add to Home screen**
2. Or use the custom install button in the app

### Safari (iOS)

1. Tap **Share** button
2. Tap **Add to Home Screen**

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Verify `next.config.ts` PWA configuration
- Ensure you're running a production build
- Clear browser cache and reload

### Manifest Not Loading

- Verify `/manifest.json` is accessible
- Check JSON syntax is valid
- Verify all icon paths are correct

### Icons Not Showing

- Ensure all icon files exist in `/public/` directory
- Verify icon paths in `manifest.json` match actual files
- Check file permissions

### Install Button Not Appearing

- Check browser console for JavaScript errors
- Verify the component is included in `layout.tsx`
- Check if app is already installed
- Verify service worker is registered

## Additional Resources

- [PWA Install Criteria](https://web.dev/install-criteria/)
- [Chrome Install Prompt](https://developer.chrome.com/docs/workbox/modules/workbox-window/)
- [Testing PWAs](https://web.dev/testing-pwas/)

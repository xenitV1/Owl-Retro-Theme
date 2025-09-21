# 🦉 Owl Retro - Cross-Browser Retro Theme Extension

## 🙏 Special Thanks

Special thanks to **Nikola** ([@nikolaNoUndo](https://x.com/nikolaNoUndo)) for the inspiration behind this retro theme concept. Your vision sparked the idea that became Owl Retro!

---

Transform any website into a beautiful retro-themed experience with customizable light/dark modes and monospace fonts.

## 🎨 Features

- **Automatic Retro Theme**: Instantly applies a nostalgic retro color palette to any website
- **Light/Dark/Auto Modes**: Choose between light theme, dark theme, or auto-detection based on system preferences  
- **Monospace Font Option**: Toggle classic monospace fonts for that authentic retro terminal feel
- **Site-Specific Control**: Allow or block the theme on specific websites
- **Color Intensity Control**: Adjust the strength of the retro colors (50-100%)
- **Performance Optimized**: Fast and efficient with minimal impact on browsing
- **SPA Support**: Works seamlessly with single-page applications

## 🎨 Retro Color Palette

- Primary: `#fbcd43` (Golden Yellow)
- Secondary: `#e64b35` (Vintage Red)
- Tertiary: `#c6312b` (Deep Red)
- Quaternary: `#992d3c` (Burgundy)
- Quinary: `#6d2744` (Purple)
- Neutral: `#b7b2a5` (Beige)
- Accent: `#685a3c` (Brown)

## 📦 Installation

### Development Mode

1. Clone or download this repository
2. Choose your browser and use the appropriate manifest file:

#### Chrome/Edge
1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `Owl-Retro` folder
5. Use the default `manifest.json`

#### Firefox
1. Open `about:debugging`
2. Click "This Firefox" > "Load Temporary Add-on"
3. Select the `manifest-firefox.json` file
4. The extension will be loaded

#### Safari
1. Open Safari > Preferences > Advanced
2. Enable "Show Develop menu in menu bar"
3. Develop > Show Extension Builder
4. Click "+" and select the `Owl-Retro` folder
5. Use the `manifest-safari.json` file

### Browser Stores (Coming Soon)

The extension will be available on browser stores:
- Chrome Web Store
- Firefox Add-ons
- Microsoft Edge Add-ons
- Safari Extensions Gallery

## 🚀 Usage

1. Click the Owl Retro icon in your browser toolbar
2. Toggle the theme on/off with the main switch
3. Choose between Light, Dark, or Auto mode
4. Enable/disable monospace fonts
5. Adjust color intensity with the slider
6. Use site-specific controls to always allow or block on current site

**Cross-Browser Features:**
- All browsers support the same feature set
- Settings sync across browser sessions
- Site-specific preferences work consistently
- Performance optimized for each browser engine

## ⚙️ Options

Access advanced settings by clicking "Settings" in the popup or right-clicking the extension icon and selecting "Options":

- Manage site allowlist/blocklist
- Configure performance settings
- Clear cache
- Reset to defaults

## 🏗️ Architecture

```
Owl-Retro/
├── manifest*.json          # Browser-specific manifests (V3)
├── icons/                  # Extension icons
├── src/
│   ├── background/        # Service worker (cross-browser)
│   ├── content/           # Content scripts
│   ├── styles/            # Theme CSS files
│   ├── popup/             # Popup UI
│   ├── options/           # Options page
│   └── utils/             # Cross-browser compatibility layers
│       ├── browser-compatibility.js  # Chrome/Firefox/Edge API abstraction
│       └── webkit-compatibility.js   # Safari WebKit API compatibility
```

## 🔒 Privacy

Owl Retro respects your privacy:
- No data collection or tracking
- All preferences stored locally
- No external requests
- Works completely offline

## 🎯 Performance

- DOM scanning: < 50ms average
- Theme application: < 100ms
- Minimal memory footprint
- Efficient cache system

## 🌐 Cross-Browser Compatibility

Owl Retro is designed to work across all major browsers with Manifest V3 support:

### ✅ Fully Supported Browsers

- **Chrome** 88+ (Manifest V3 optimized)
- **Firefox** 109+ (Gecko API compatibility layer)
- **Safari** 16+ (WebKit API compatibility layer)
- **Edge** 88+ (Chromium-based)
- **Brave**, **Vivaldi**, **Opera** (Chromium-based)

### 🔧 Browser-Specific Features

- **Firefox**: Native `browser.*` API support with fallback compatibility
- **Safari**: WebKit extension API with localStorage fallback
- **Chrome/Edge**: Optimized Manifest V3 with full API support
- **All browsers**: Unified BrowserAPI abstraction layer

### 📁 Manifest Files

Each browser has its optimized manifest configuration:
- `manifest.json` - Chrome/Edge (default)
- `manifest-firefox.json` - Firefox specific
- `manifest-safari.json` - Safari specific
- `manifest-edge.json` - Edge specific

## 🐛 Known Issues

- Some websites with strict CSP may not fully support inline styles
- Complex gradients are preserved as-is to maintain layouts
- Video/image elements are not color-shifted

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📜 License

MIT License - feel free to use and modify as needed.

## 🙏 Credits

Created with ❤️ by the Xenit

Special thanks to **Nikola** ([@nikolaNoUndo](https://x.com/nikolaNoUndo)) for the inspiration behind this retro theme concept.

---

**Note**: This extension modifies the visual appearance of websites. Some sites may not display correctly with the theme applied. You can easily disable the theme for specific sites using the site controls.

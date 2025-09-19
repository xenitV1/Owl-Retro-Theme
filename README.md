# 🦉 Owl Retro - Retro Theme Chrome Extension

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
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `Owl-Retro` folder
6. The extension icon will appear in your toolbar!

### Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon.

## 🚀 Usage

1. Click the Owl Retro icon in your Chrome toolbar
2. Toggle the theme on/off with the main switch
3. Choose between Light, Dark, or Auto mode
4. Enable/disable monospace fonts
5. Adjust color intensity with the slider
6. Use site-specific controls to always allow or block on current site

## ⚙️ Options

Access advanced settings by clicking "Settings" in the popup or right-clicking the extension icon and selecting "Options":

- Manage site allowlist/blocklist
- Configure performance settings
- Clear cache
- Reset to defaults

## 🏗️ Architecture

```
Owl-Retro/
├── manifest.json           # Extension manifest (V3)
├── icons/                  # Extension icons
├── src/
│   ├── background/        # Service worker
│   ├── content/           # Content scripts
│   ├── styles/            # Theme CSS files
│   ├── popup/             # Popup UI
│   ├── options/           # Options page
│   └── utils/             # Shared utilities
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

## 🧪 Browser Compatibility

- Chrome 88+
- Edge 88+
- Brave
- Vivaldi
- Any Chromium-based browser

## 🐛 Known Issues

- Some websites with strict CSP may not fully support inline styles
- Complex gradients are preserved as-is to maintain layouts
- Video/image elements are not color-shifted

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📜 License

MIT License - feel free to use and modify as needed.

## 🙏 Credits

Created with ❤️ by the Owl Retro Team

Special thanks to **Nikola** ([@nikolaNoUndo](https://x.com/nikolaNoUndo)) for the inspiration behind this retro theme concept.

---

**Note**: This extension modifies the visual appearance of websites. Some sites may not display correctly with the theme applied. You can easily disable the theme for specific sites using the site controls.

# Logo Setup Guide for Welcome Screen

## 📋 Required Logo Files

You need to add **2 logo files** to this directory:

1. **`leo-club-logo.png`** - Leo Club of University of Moratuwa logo
2. **`plastic-cycle-logo.png`** - Plastic Cycle collaborator logo

---

## 📁 File Location

Place the logo files here:
```
frontend/
  assets/
    images/
      ├── leo-club-logo.png       ← Add this file
      ├── plastic-cycle-logo.png  ← Add this file
      └── LOGO_SETUP_GUIDE.md     (this file)
```

---

## 🎨 Logo Specifications

### Recommended Settings:
- **Format:** PNG with transparent background
- **Size:** 240x180px (or similar 4:3 ratio)
- **Resolution:** At least 2x for retina displays (480x360px)
- **Background:** Transparent (for white logo box on welcome screen)
- **Color mode:** RGB

### Alternative Sizes (any of these work):
- 240x180px (1x)
- 480x360px (2x - recommended)
- 720x540px (3x - best quality)

---

## 🖼️ How to Prepare Your Logos

### Option 1: Using Photoshop/GIMP
1. Open your logo file
2. Resize to 480x360px (keeping aspect ratio)
3. Remove background (make transparent)
4. Export as PNG with transparency
5. Save as `leo-club-logo.png` and `plastic-cycle-logo.png`

### Option 2: Using Online Tools
1. Go to https://www.remove.bg/ (remove background)
2. Go to https://www.resizepixel.com/ (resize image)
3. Download as PNG
4. Rename appropriately

### Option 3: Using Mac Preview
1. Open image in Preview
2. Tools → Adjust Size
3. Set width to 480px (height adjusts automatically)
4. File → Export → Format: PNG
5. Save as required filename

---

## ✅ After Adding Logos

Once you've added both logo files, the welcome screen will automatically display:

1. **Leo Club logo** with label "Leo Club of University of Moratuwa"
2. **"In collaboration with"** text
3. **Plastic Cycle logo** with label "Plastic Cycle"

All logos will appear in white rounded boxes at the bottom of the welcome screen.

---

## 🚀 Testing

After adding the logos:

1. Run the app:
   ```bash
   npx expo start
   ```

2. Navigate to the welcome screen

3. Verify both logos display correctly

---

## 🐛 Troubleshooting

### If logos don't show up:

1. **Check file names** - Must be exact:
   - `leo-club-logo.png` (lowercase, with hyphens)
   - `plastic-cycle-logo.png` (lowercase, with hyphens)

2. **Check file location** - Must be in:
   ```
   frontend/assets/images/
   ```

3. **Clear cache and rebuild**:
   ```bash
   npx expo start -c
   ```

4. **Verify file format** - Must be PNG (not JPG, JPEG, or other formats)

---

## 📝 Current Logo Display Settings

In `welcome.tsx`, the logos are displayed with these styles:

```typescript
leoLogo: {
    width: 80,
    height: 60,
}
plasticCycleLogo: {
    width: 80,
    height: 60,
}
```

If you need to adjust the size, modify these values in the `welcome.tsx` file.

---

## 💡 Need Help?

If you need to adjust:
- Logo sizes → Edit `leoLogo` and `plasticCycleLogo` styles
- Logo box colors → Edit `logoBox` backgroundColor
- Logo spacing → Edit `logoContainer` marginVertical
- Logo labels → Edit the `<Text style={styles.logoText}>` content

---

**All set! Just add your 2 logo PNG files and you're ready to go! 🎉**

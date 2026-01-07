# Jellyfin Media Bar Enhanced Plugin

Media Bar Enhanced is a plugin for Jellyfin that introduces a customizable and interactive media bar to your dashboard view on Jellyfin web.

This plugin is a fork and enhancement of the original [Media Bar by MakD](https://github.com/MakD/Jellyfin-Media-Bar), but can be installed as plugin for easier installation and management/configuration.

![logo](https://raw.githubusercontent.com/CodeDevMLH/jellyfin-plugin-media-bar-enhanced/main/logo.png)

---

## Table of Contents
- [Jellyfin Media Bar Enhanced Plugin](#jellyfin-media-bar-enhanced-plugin)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
    - [New Features \& Enhancements](#new-features--enhancements)
    - [Core Features](#core-features)
  - [Installation](#installation)
  - [Client Compatibility](#client-compatibility)
  - [Configuration](#configuration)
    - [General Settings](#general-settings)
    - [Custom Content](#custom-content)
    - [Advanced Settings](#advanced-settings)
  - [Build The Plugin By Yourself](#build-the-plugin-by-yourself)
  - [Troubleshooting](#troubleshooting)
    - [Effects Not Showing](#effects-not-showing)
    - [Docker Permission Issues](#docker-permission-issues)
  - [Contributing](#contributing)

---

## Overview
![demo](https://github.com/user-attachments/assets/3a01b886-1a96-4dd1-abf6-e9c3b054bfde)

Expand to get more impressions:

<details>
<summary>Desktop Layout</summary> 

<img width="1920" height="1080" alt="trailer button" src="https://github.com/user-attachments/assets/5dce8eb1-8f2f-4583-a6d5-16f27ced8608" />
Normal mode like the original with additional trailer button
<br><br><br>

<img width="1920" height="993" alt="modal_desktop" src="https://github.com/user-attachments/assets/9087f43d-cd9d-4581-a7e0-404b75bc8e02" />
Trailer modal
<br><br><br>

<img width="1920" height="994" alt="config" src="https://github.com/user-attachments/assets/5492c384-a5c4-47ee-9428-3d9de2748e63" />
Excerpt from the config: E.g. here you can simply add your items that should be displayed
<br><br>
</details>


<details>
<summary>Mobile Layout</summary> 

![demo_mobile](https://github.com/user-attachments/assets/d11a7ed0-ceb7-43c3-9b22-09510251e0aa)
<br>If trailer on mobile is eenabled...
<br><br><br>

<img width="1080" height="2199" alt="mobile" src="https://github.com/user-attachments/assets/f0a0cc0d-f019-45f5-96c8-a5de14bf92ba" />
Normal mode like the original with additional trailer button
<br><br><br>

<img width="1080" height="2199" alt="trailer_modal_mobile" src="https://github.com/user-attachments/assets/944f9b82-9c9b-411f-883b-877b65ed933f" />
Trailer modal in portrait mode
<br><br>
</details>


## Features

This plugin builds upon the original Media Bar with new capabilities and improvements:

### New Features & Enhancements
*   **Video Backdrop Support**: Play trailer as background video directly in the slideshow
*   **SponsorBlock Integration**: Automatically skip intro/outro segments in YouTube trailers
*   **Enhanced Controls**:
    *   Keyboard shortcuts (Arrow keys to navigate, Space to pause, M to mute)
    *   Option to always show navigation arrows
    *   Standalone "Trailer" button (opens in a modal) if video backdrops are disabled
*   **Smarter Playback**:
    *   Option to wait for the trailer to end before advancing the slide.
    *   Mute/Unmute controls
*   **Customization**:
    *   **Custom Media IDs**: Manually specify which items (Movies, Series, Collections/Boxsets) to display. Easily configurable via the plugin settings
    *   **Seasonal Content Mode**: Define date-based lists for holidays and seasons (e.g., Halloween, Christmas)
    *   Pagination dots turn into a counter (e.g., 1/20) if the limit is exceeded
    *   Option to disable the loading screen

### Core Features
*   **Immersive Slideshow**: Rotates through your media library
*   **Metadata Display**: Shows title, rating, year, and plot summary
*   **Direct Play**: Click "Play" to start watching immediately
*   **Details View**: Click "Info" to jump to the item's detail page
*   **Add To Favorites**: Click the heart to add the item to your favorites

## Installation

This plugin is based on Jellyfin Version `10.11.x`

1.  Open your **Jellyfin Dashboard**.
2.  Navigate to **Plugins** > **Repositories**.
3.  Click the **+** button to add a new repository.
4.  Enter a name for the repo and paste the following URL:
    ```
    https://raw.githubusercontent.com/CodeDevMLH/jellyfin-plugin-manifest/refs/heads/main/manifest.json
    ```
5.  Click **Save**.
6.  Go to the **Catalog** tab.
7.  Find **Media Bar Enhanced** (Under **General**) and install it.
8.  **Restart your Jellyfin server.**
9.  **Refresh your browser** (Ctrl+F5) to load the new interface elements.

## Client Compatibility

Because this plugin relies on injecting JavaScript and CSS into the web interface, it works best on clients that use the web wrapper.

| Client Platform | Status | Notes |
| :--- | :---: | :--- |
| **Web Browsers** (Chrome, Firefox, Edge, etc.) | ✅ | Fully supported. |
| **Jellyfin Media Player** (Windows/Linux/macOS) | ✅ | Fully supported. |
| **Android App** | ✅ | Works (Web wrapper). |
| **iOS App** | ✅ | Works (Web wrapper). |
| **Android TV / Fire TV** | ❌ | **Not supported** (Native UI). |
| **Roku** | ❌ | **Not supported** (Native UI). |
| **Swiftfin** | ❌ | **Not supported** (Native UI). |

## Configuration

Configure the plugin via **Dashboard** > **Plugins** > **Media Bar Enhanced**.

> [!NOTE]
> You must refresh your browser window (F5 or Ctrl+R) after saving changes for them to take effect.

### General Settings
*   **Enable Media Bar Enhanced Plugin**: Master switch to toggle the plugin.
*   **Enable Video Backdrops**: Dynamically plays trailers in the background.
*   **Wait For Trailer To End**: Prevents slide transition until the video finishes.
*   **Enable Mobile Video**: specific setting to allow video playback on mobile devices (disabled by default to save data/battery).
*   **Show Trailer Button**: Adds a button to open the trailer in a popup modal if video backdrops are disabled (e.g. on mobile if trailers are disabled there)

### Custom Content
Define exactly what shows up in your bar.

*   **Enable Custom Media IDs**: Restrict the slideshow to a specific list of IDs.
*   **Enable Seasonal Content Mode**: Advanced date-based scheduling.
    *   Format: `DD.MM-DD.MM | Name | ID1, ID2, ID3`
    *   Example: `20.10-31.10 | Halloween | <ID_OF_HALLOWEEN_COLLECTION>`
    *   If the current date matches a range, those IDs are used. Otherwise, it defaults to standard behavior or the Custom Media IDs list.

**How to get IDs:**
Check the URL of an item in the web interface:
`.../web/#/details?id=YOUR_ITEM_ID_HERE&...`

### Advanced Settings
*   **Slide Animations**: Enable/disable the "Zoom In" effect.
*   **Use SponsorBlock**: Skips non-content segments in YouTube trailers (if the data exists).
*   **Start Muted**: Videos start without sound (user can unmute).
*   **Full Width Video**: Stretches video to cover the entire width (good for desktop, crop on mobile).
*   **Enable Loading Screen**: Enable/disable the loading indicator while the bar initializes.
*   **Always Show Arrows**: Keeps navigation arrows visible instead of hiding them on mouse leave.
*   **Enable Keyboard Controls**:
    *   `Left`/`Right`: Change slide
    *   `Space`: Pause/Play slideshow
    *   `M`: Mute/Unmute video
*   **Content Limits**: Fine-tune performance by limiting the number of items (Movies, TV Shows) fetched.

## Build The Plugin By Yourself

If you want to build the plugin yourself:

1.  Clone the repository.
2.  Ensure you have the .NET SDK installed (NET 8 or 9 depending on your Jellyfin version).
3.  Run the build command:
    ```powershell
    dotnet build Jellyfin.Plugin.MediaBarEnhanced/Jellyfin.Plugin.MediaBarEnhanced.csproj --configuration Release --output bin/Publish
    ```
4.  The compiled DLL and resources will be in bin/Publish.

## Troubleshooting

### Effects Not Showing
1. **Verify plugin installation**:
   - Check that the plugin appears in the jellyfin admin panel
   - Ensure that the plugin is enabled and active

2. **Clear browser cache**:
   - Force refresh browser (Ctrl+F5)
   - Clear jellyfin web client cache (--> mostly you have to clear the whole browser cache)

### Docker Permission Issues
If you encounter the message `Access was denied when attempting to inject script into index.html. Automatic direct injection failed. Automatic direct insertion failed. The system will now attempt to use the File Transformation plugin.` in the log or similar permission errors in Docker:

**Option 1: Use File Transformation Plugin (Recommended)**

Media Bar Enhanced now automatically detects and uses the [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) plugin (v2.5.0.0+) if it's installed. This eliminates permission issues by transforming content at runtime without modifying files on disk.

**Installation Steps:**
1. Install the File Transformation plugin from the Jellyfin plugin catalog
2. Restart Jellyfin
3. Media Bar Enhanced will automatically detect and use it (no configuration needed)
4. Check logs to confirm: Look for "Successfully registered transformation with File Transformation plugin"

**Benefits:**
- No file permission issues in Docker environments
- Works with read-only web directories
- Survives Jellyfin updates without re-injection
- No manual file modifications required

**Option 2: Fix File Permissions**
```bash
# Find the actual index.html location
docker exec -it jellyfin find / -name index.html

# Fix ownership (replace 'jellyfin' with your container name and adjust user:group if needed)
docker exec -it --user root jellyfin chown jellyfin:jellyfin /jellyfin/jellyfin-web/index.html

# Restart container
docker restart jellyfin
```

**Option 3: Manual Volume Mapping**
```bash
# Extract index.html from container
docker cp jellyfin:/jellyfin/jellyfin-web/index.html /path/to/jellyfin/config/index.html

# Add to docker-compose.yml volumes section:
volumes:
  - /path/to/jellyfin/config/index.html:/jellyfin/jellyfin-web/index.html
```

## Contributing

Feel free to contribute to this project by creating pull requests or reporting issues.

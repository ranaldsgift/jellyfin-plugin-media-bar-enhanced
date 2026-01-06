using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.MediaBarEnhanced.Configuration
{
    /// <summary>
    /// Plugin configuration.
    /// </summary>
    public class PluginConfiguration : BasePluginConfiguration
    {
        public int ShuffleInterval { get; set; } = 7000;
        public int RetryInterval { get; set; } = 500;
        public int MinSwipeDistance { get; set; } = 50;
        public int LoadingCheckInterval { get; set; } = 100;
        public int MaxPlotLength { get; set; } = 360;
        public int MaxMovies { get; set; } = 15;
        public int MaxTvShows { get; set; } = 15;
        public int MaxItems { get; set; } = 500;
        public int PreloadCount { get; set; } = 3;
        public int FadeTransitionDuration { get; set; } = 500;
        public int MaxPaginationDots { get; set; } = 15;
        public bool SlideAnimationEnabled { get; set; } = true;
        public bool EnableVideoBackdrop { get; set; } = true;
        public bool UseSponsorBlock { get; set; } = true;
        public bool WaitForTrailerToEnd { get; set; } = true;
        public bool StartMuted { get; set; } = true;
        public bool FullWidthVideo { get; set; } = true;
        public bool EnableMobileVideo { get; set; } = false;
        public bool ShowTrailerButton { get; set; } = true;
        public bool EnableLoadingScreen { get; set; } = true;
        public bool EnableKeyboardControls { get; set; } = true;
        public bool AlwaysShowArrows { get; set; } = false;
        public string CustomMediaIds { get; set; } = "";
        public bool EnableCustomMediaIds { get; set; } = false;
        public bool EnableSeasonalContent { get; set; } = false;
        public bool IsEnabled { get; set; } = true;
    }
}

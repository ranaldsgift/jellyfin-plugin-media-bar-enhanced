using System;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Jellyfin.Plugin.MediaBarEnhanced;
using Jellyfin.Plugin.MediaBarEnhanced.Configuration;

namespace Jellyfin.Plugin.MediaBarEnhanced.Api
{
    /// <summary>
    /// Controller for serving MediaBarEnhanced resources and configuration.
    /// </summary>
    [ApiController]
    [Route("MediaBarEnhanced")]
    public class MediaBarEnhancedController : ControllerBase
    {
        /// <summary>
        /// Gets the current plugin configuration.
        /// </summary>
        /// <returns>The configuration object.</returns>
        [HttpGet("Config")]
        [Produces("application/json")]
        public ActionResult<PluginConfiguration> GetConfig()
        {
            return MediaBarEnhancedPlugin.Instance?.Configuration ?? new PluginConfiguration();
        }

        /// <summary>
        /// Serves embedded resources.
        /// </summary>
        /// <param name="path">The path to the resource.</param>
        /// <returns>The resource file.</returns>
        [HttpGet("Resources/{*path}")]
        public ActionResult GetResource(string path)
        {
            // Sanitize path
            if (string.IsNullOrWhiteSpace(path) || path.Contains("..", StringComparison.Ordinal))
            {
                return BadRequest();
            }

            var assembly = typeof(MediaBarEnhancedPlugin).Assembly;
            var resourcePath = path.Replace('/', '.').Replace('\\', '.');
            var resourceName = $"Jellyfin.Plugin.MediaBarEnhanced.Web.{resourcePath}";

            var stream = assembly.GetManifestResourceStream(resourceName);

            // if (stream == null)
            // {   
            //     // Try fallback/debug matching
            //     var allNames = assembly.GetManifestResourceNames();
            //     var match = Array.Find(allNames, n => n.EndsWith(resourcePath, StringComparison.OrdinalIgnoreCase));

            //     if (match != null)
            //     {
            //         stream = assembly.GetManifestResourceStream(match);
            //     }
            // }

            if (stream == null)
            {
                return NotFound($"Resource not found: {resourceName}");
            }

            var contentType = GetContentType(path);
            return File(stream, contentType);
        }

        private string GetContentType(string path)
        {
            if (path.EndsWith(".js", StringComparison.OrdinalIgnoreCase)) return "application/javascript";
            if (path.EndsWith(".css", StringComparison.OrdinalIgnoreCase)) return "text/css";
            if (path.EndsWith(".html", StringComparison.OrdinalIgnoreCase)) return "text/html";
            if (path.EndsWith(".svg", StringComparison.OrdinalIgnoreCase)) return "image/svg+xml";
            return "application/octet-stream";
        }
    }
}

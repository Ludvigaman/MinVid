using Microsoft.AspNetCore.Mvc;
using MinVid_API.Models;
using MinVid_API.Services;
using System.Text.Json;

namespace MinVid_API.Controllers
{
    public class VideoController : Controller
    {
        private readonly VideoService _videoService;

        public VideoController(VideoService videoService) {
            _videoService = videoService;
        }

        [HttpGet("getAllVideos")]
        public List<VideoMetadata> GetCatalog()
        {
            var videos = _videoService.GetVideoMetadataCatalog();
            return videos;
        }

        [HttpGet("getLatestVideos")]
        public List<VideoMetadata> GetLatestCatalog()
        {
            var videos = _videoService.GetVideoMetadataCatalogLastTen();
            return videos;
        }

        [HttpGet("getVideoMetadata/{videoId}")]
        public VideoMetadata GetVideoMetadata(string videoId)
        {
            var video = _videoService.GetVideoMetadata(videoId);
            return video;
        }

        [HttpGet("getThumbnail/{videoId}")]
        public IActionResult GetThumbnail(string videoId)
        {
            try
            {
                var stream = _videoService.GetVideoThumbnail(videoId);
                return File(stream, "image/jpeg"); 
            }
            catch (FileNotFoundException)
            {
                return NotFound("Thumbnail not found");
            }
        }

        [HttpGet("video/{videoId}")]
        public IActionResult GetVideo(string videoId)
        {
            try
            {
                var metadata = _videoService.GetVideoMetadata(videoId);
                if (metadata == null)
                    return NotFound("Metadata not found");

                var stream = _videoService.GetVideo(videoId, metadata.format);
                var mimeType = $"video/{metadata.format}"; 

                return File(stream, mimeType, enableRangeProcessing: true);
            }
            catch (FileNotFoundException)
            {
                return NotFound("Video not found");
            }
        }

        [HttpPost("upload")]
        [RequestSizeLimit(500_000_000)] // optional: limit to 500MB
        public async Task<IActionResult> UploadVideo([FromForm] IFormFile videoFile, [FromForm] string metadataJson)
        {
            if (videoFile == null || string.IsNullOrWhiteSpace(metadataJson))
                return BadRequest("Missing video or metadata.");

            try
            {
                var id = await _videoService.SaveVideoAsync(videoFile, metadataJson);
                return Ok(new { id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upload error: {ex.Message}");
                return StatusCode(500, "Failed to upload video.");
            }
        }

    }
}

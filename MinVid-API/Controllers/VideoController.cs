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

        [HttpGet("login/{password}")]
        public bool Login(string password)
        {
            return _videoService.Login(password);
        }

        [HttpPost("resetPassword")]
        public bool ChangePassword([FromBody] PasswordChangeObject pwObj)
        {
            return _videoService.ChangePassword(pwObj);
        }

        [HttpGet("delete/{videoId}")]
        public bool Delete(string videoId)
        {
            return _videoService.Delete(videoId);
        }

        [HttpGet("getAllVideos")]
        public List<VideoMetadata> GetCatalog(bool unrestricted)
        {
            var videos = _videoService.GetVideoMetadataCatalog(false, unrestricted);
            return videos;
        }

        [HttpPost("search")]
        public List<VideoMetadata> Search([FromBody] string[] tags, bool unrestricted)
        {
            var list = tags.ToList();
            var videos = _videoService.Search(list, unrestricted);
            return videos;
        }


        [HttpPost("searchShorts")]
        public List<VideoMetadata> SearchShorts([FromBody] string[] tags, bool unrestricted)
        {
            var list = tags.ToList();
            var videos = _videoService.SearchShorts(list, unrestricted);
            return videos;
        }

        [HttpPost("updateMetadata")]
        public async Task<bool> UpdateMetadata([FromBody] VideoMetadata metadata)
        {
            var res = await _videoService.UpdateMetadataAsync(metadata);
            return res;
        }

        [HttpGet("getTotalVideoCount")]
        public int GetTotalVideoCount(bool unrestricted)
        {
            return _videoService.GetTotalVideoCount(false, unrestricted);
        }

        [HttpGet("getLatestVideos/{page}")]
        public List<VideoMetadata> GetLatestCatalog(int page, bool unrestricted)
        {
            var videos = _videoService.GetVideoMetadataCatalogCount(page, unrestricted);
            return videos;
        }

        [HttpGet("getTotalShortsCount")]
        public int GetTotalShortsCount(bool unrestricted)
        {
            return _videoService.GetTotalVideoCount(true, unrestricted);
        }


        [HttpGet("getLatestShorts/{page}")]
        public List<VideoMetadata> GetLatestShortsCatalog(int page, bool unrestricted)
        {
            var videos = _videoService.GetShortsMetadataCatalogCount(page, unrestricted);
            return videos;
        }

        [HttpGet("getVideoMetadata/{videoId}")]
        public VideoMetadata GetVideoMetadata(string videoId)
        {
            var video = _videoService.GetVideoMetadata(videoId);
            return video;
        }

        [HttpGet("getRecommended/{videoId}")]
        public List<VideoMetadata> GetRecommended(string videoId, bool unrestricted)
        {
            var videos = _videoService.GetSimilar(videoId, unrestricted);
            return videos;
        }

        [HttpGet("getVideosWithTag/{tag}")]
        public List<VideoMetadata> GetVideosWithTag(string tag, bool unrestricted)
        {
            var videos = _videoService.GetWithTag(tag, unrestricted);
            return videos;
        }

        [HttpGet("getShortsWithTag/{tag}")]
        public List<VideoMetadata> GetShortsWithTag(string tag, bool unrestricted)
        {
            var videos = _videoService.GetShortsWithTag(tag, unrestricted);
            return videos;
        }

        [HttpGet("getTagList")]
        public List<string> GetTagList(bool unrestricted)
        {
            var tags = _videoService.GetTagList(unrestricted);
            return tags;
        }


        [HttpGet("getTagListCount")]
        public Dictionary<string, int> GetTagListCount(bool unrestricted)
        {
            var tagCount = _videoService.GetTagListCount(unrestricted);
            return tagCount;
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

        [HttpGet("scanLibrary/")]
        public async Task<List<string>> ScanLibrary()
        {
            var amountScanned = await _videoService.InitializeUnprocessedVideos();
            return amountScanned;
        }

        [HttpGet("video/{videoId}")]
        public IActionResult GetVideo(string videoId)
        {
            try
            {
                var metadata = _videoService.GetVideoMetadata(videoId);
                if (metadata == null)
                    return NotFound("Metadata not found");

                var mimeType = $"video/{metadata.format}";

                var videoPath = _videoService.GetVideoPath(videoId, metadata.format);

                Response.Headers["Cache-Control"] = "public, max-age=86400";
                Response.Headers["Accept-Ranges"] = "bytes";

                return PhysicalFile(videoPath, mimeType, enableRangeProcessing: true);
            }
            catch (FileNotFoundException)
            {
                return NotFound("Video not found");
            }
        }

        [HttpPost("upload")]
        [RequestSizeLimit(long.MaxValue)]
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

        [HttpPost("upload-thumbnail/{videoId}")]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> UploadThumbnail([FromForm] IFormFile thumbnail, string videoId)
        {
            if (thumbnail == null || thumbnail.Length == 0)
                return BadRequest("No thumbnail file uploaded.");

            try
            {
                await _videoService.SaveThumbnailAsync(videoId, thumbnail);
                return Ok(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Thumbnail upload error: {ex.Message}");
                return StatusCode(500, false);
            }
        }


    }
}

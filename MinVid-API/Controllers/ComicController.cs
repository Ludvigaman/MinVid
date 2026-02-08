using Microsoft.AspNetCore.Mvc;
using MinVid_API.Models;
using MinVid_API.Services;
using System.Text.Json;

namespace MinVid_API.Controllers
{
    public class ComicController : Controller
    {
        private readonly ComicService _comicService;

        public ComicController(ComicService comicService)
        {
            _comicService = comicService;
        }

        [HttpPost("uploadComic")]
        public IActionResult UploadComic([FromForm] string metadataJson, [FromForm] List<IFormFile> pages)
        {
            try
            {
                var metadata = JsonSerializer.Deserialize<Comic>(metadataJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (metadata == null)
                    return BadRequest(new { id = "0" });

                var id = _comicService.CreateComic(metadata, pages);
                return Ok(new { id });
            }
            catch (Exception)
            {
                return StatusCode(500, new { id = "500" });
            }
        }

        [HttpGet("comic/{comicId}")]
        public Comic GetComic(string comicId)
        {
            try
            {
                return _comicService.GetComic(comicId);
            }
            catch (FileNotFoundException)
            {
                return null;
            }
        }

        [HttpGet("comicCatalog/{page}")]
        public List<Comic> GetCatalog(int page, bool unrestricted)
        {
            const int pageSize = 16;

            return _comicService
                        .GetCatalog(unrestricted)
                        .OrderByDescending(c => c.uploadDate)
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToList();
        }

        [HttpPost("comicSearch")]
        public List<Comic> GetCatalog([FromBody] string[] tags, bool unrestricted)
        {
            var list = tags.ToList();
            var images = _comicService.Search(list, unrestricted);
            return images.Reverse<Comic>().ToList();
        }

        [HttpGet("getTotalComicCount")]
        public int GetTotalVideoCount(bool unrestricted)
        {
            return _comicService.GetTotalComicCount(unrestricted);
        }

        [HttpGet("deleteComic/{comicId}")]
        public bool Delete(string comicId)
        {
            return _comicService.DeleteComic(comicId);
        }

        [HttpPost("uploadComicZip")]
        public async Task<ActionResult<string>> UploadComicZip([FromForm] string metadataJson, [FromForm] IFormFile zipFile)
        {
            try
            {
                var metadata = JsonSerializer.Deserialize<Comic>(metadataJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (metadata == null || zipFile == null)
                    return BadRequest("Invalid input");

                string comicId = await _comicService.CreateComicFromZipAsync(metadata, zipFile);
                return Ok(comicId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("comicImage/{comicId}/{pageNumber}")]
        public IActionResult GetPageImage(string comicId, string pageNumber)
        {
            try
            {
                return _comicService.GetPageImage(comicId, pageNumber);
            }
            catch (FileNotFoundException)
            {
                return NotFound("Image file not found.");
            }
        }

    }
}

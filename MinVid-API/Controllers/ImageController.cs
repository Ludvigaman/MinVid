using Microsoft.AspNetCore.Mvc;
using MinVid_API.Models;
using MinVid_API.Services;
using System.Threading.Tasks;

namespace MinVid_API.Controllers
{
    public class ImageController : Controller
    {
        private readonly ImageService _imageService;

        public ImageController(ImageService imgService) 
        {
            _imageService = imgService;
        }

        [HttpGet("getImageCatalog")]
        public List<ImageMetadata> GetCatalog()
        {
            var images = _imageService.GetImageCatalog();
            return images;
        }

        [HttpGet("getLatestImages/{page}")]
        public List<ImageMetadata> GetCatalog(int page)
        {
            const int pageSize = 16;

            var images = _imageService.GetImageCatalog()
                                      .Skip((page - 1) * pageSize)
                                      .Take(pageSize)
                                      .ToList();

            return images;
        }


        [HttpGet("deleteImage/{id}")]
        public async Task<bool> GetCatalog(string id)
        {
            return await _imageService.DeleteImageAsync(id);
        }

        [HttpGet("getTotalImageCount")]
        public int GetTotalVideoCount()
        {
            return _imageService.GetTotalImageCount();
        }

        [HttpPost("searchImages")]
        public List<ImageMetadata> Search([FromBody] string[] tags)
        {
            var list = tags.ToList();
            var images = _imageService.Search(list);
            return images.Reverse<ImageMetadata>().ToList();
        }

        [HttpGet("getImagesWithTag/{tag}")]
        public List<ImageMetadata> GetImagesWithTag(string tag)
        {
            var images = _imageService.GetWithTag(tag);
            return images;
        }

        [HttpGet("image/{imageId}")]
        public IActionResult GetImage(string imageId)
        {
            var images = _imageService.GetImageCatalog();
            var metadata = images.FirstOrDefault(img => img.id == imageId);

            if (metadata == null)
                return NotFound("Image metadata not found.");

            try
            {
                var result = _imageService.GetImage(imageId, metadata.format);
                return result;
            }
            catch (FileNotFoundException)
            {
                return NotFound("Image file not found.");
            }
        }

        [HttpPost("uploadImage")]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile imageFile, [FromForm] string metadataJson)
        {
            if (imageFile == null || string.IsNullOrWhiteSpace(metadataJson))
                return BadRequest("Missing image or metadata.");

            try
            {
                var id = await _imageService.SaveImageAsync(imageFile, metadataJson);
                return Ok(new { id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upload error: {ex.Message}");
                return StatusCode(500, "Failed to upload image.");
            }
        }

    }
}

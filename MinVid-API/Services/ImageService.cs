using Microsoft.AspNetCore.Mvc;
using MinVid_API.Models;
using System.Text.Json;

namespace MinVid_API.Services
{
    public class ImageService
    {
        private readonly string _dataPath;

        public ImageService(IConfiguration configuration)
        {
            _dataPath = configuration.GetValue<string>("image_data_path");
        }

        public FileStreamResult GetImage(string imageId, string format)
        {
            var fileName = $"{imageId}.{format}";
            var path = Path.Combine(_dataPath, fileName);

            if (!File.Exists(path))
                throw new FileNotFoundException("Image not found");

            var contentType = format.ToLower() switch
            {
                "jpg" or "jpeg" => "image/jpeg",
                "png" => "image/png",
                "gif" => "image/gif",
                "bmp" => "image/bmp",
                "webp" => "image/webp",
                _ => "application/octet-stream" // Fallback
            };

            var stream = new FileStream(path, FileMode.Open, FileAccess.Read);
            return new FileStreamResult(stream, contentType);
        }

        public List<ImageMetadata> GetImageCatalog()
        {
            var catalog = new List<ImageMetadata>();

            if (!Directory.Exists(_dataPath))
                return catalog;

            var catalogFilePath = Path.Combine(_dataPath, "catalog.json");

            if (!File.Exists(catalogFilePath))
                return catalog;

            try
            {
                var json = File.ReadAllText(catalogFilePath);

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var metadataList = JsonSerializer.Deserialize<List<ImageMetadata>>(json, options);

                if (metadataList != null)
                    catalog = metadataList;
            }
            catch (Exception ex)
            {
                // Optional: log the error
                Console.WriteLine($"Error reading catalog file: {ex.Message}");
            }

            return catalog;
        }

        public List<ImageMetadata> Search(List<string> tags)
        {
            if (tags == null || tags.Count == 0)
                return new List<ImageMetadata>();

            var catalog = GetImageCatalog();

            var scoredImages = catalog
                .Select(image => new
                {
                    Image = image,
                    Score = image.tags.Intersect(tags, StringComparer.OrdinalIgnoreCase).Count()
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Select(x => x.Image)
                .ToList();

            return scoredImages;
        }

        public List<ImageMetadata> GetWithTag(string tag)
        {
            if (string.IsNullOrWhiteSpace(tag))
                return new List<ImageMetadata>();

            var catalog = GetImageCatalog();

            var matchedImages = catalog
                .Where(video => video.tags.Any(t => string.Equals(t, tag, StringComparison.OrdinalIgnoreCase))).Reverse()
                .ToList();

            return matchedImages;
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile, string metadataJson)
        {
            var metadata = JsonSerializer.Deserialize<ImageMetadata>(metadataJson, new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNameCaseInsensitive = true
            }) ?? throw new Exception("Invalid metadata");

            metadata.id = Guid.NewGuid().ToString();

            var imageFileName = $"{metadata.id}.{metadata.format}";
            var imagePath = Path.Combine(_dataPath, imageFileName);

            Directory.CreateDirectory(_dataPath);

            using (var stream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            // Update centralized catalog.json
            var catalogPath = Path.Combine(_dataPath, "catalog.json");
            List<ImageMetadata> catalog = new();

            if (File.Exists(catalogPath))
            {
                try
                {
                    var existingJson = await File.ReadAllTextAsync(catalogPath);
                    catalog = JsonSerializer.Deserialize<List<ImageMetadata>>(existingJson) ?? new List<ImageMetadata>();
                }
                catch
                {
                    catalog = new List<ImageMetadata>(); // fallback on error
                }
            }

            catalog.Add(metadata);

            var updatedJson = JsonSerializer.Serialize(catalog, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(catalogPath, updatedJson);

            return metadata.id;
        }


    }
}

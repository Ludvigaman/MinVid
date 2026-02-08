using Microsoft.AspNetCore.Mvc;
using MinVid_API.Models;
using System.IO.Compression;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MinVid_API.Services
{
    public class ComicService
    {

        private readonly string _dataPath;

        public ComicService(IConfiguration configuration)
        {
            var runningInContainer = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";

            if (runningInContainer)
            {
                _dataPath = configuration.GetValue<string>("docker_comic_data_path");
            }
            else
            {
                _dataPath = configuration.GetValue<string>("comic_data_path");
            }
        }

        public FileStreamResult GetPageImage(string comicId, string pageNumber)
        {
            var comicPath = Path.Combine(_dataPath, comicId);

            if (!Directory.Exists(comicPath))
                throw new DirectoryNotFoundException("Comic folder not found");

            // Look for any file where the filename (without extension) ends with the given page number
            var matchingFile = Directory
                .GetFiles(comicPath)
                .FirstOrDefault(file =>
                {
                    var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file);
                    return fileNameWithoutExtension == pageNumber ||
                           fileNameWithoutExtension.TrimStart('0') == pageNumber;
                });

            if (matchingFile == null || !File.Exists(matchingFile))
                throw new FileNotFoundException("Image not found");

            var extension = Path.GetExtension(matchingFile).TrimStart('.').ToLowerInvariant();

            var contentType = extension switch
            {
                "jpg" or "jpeg" => "image/jpeg",
                "png" => "image/png",
                "gif" => "image/gif",
                "bmp" => "image/bmp",
                "webp" => "image/webp",
                _ => "application/octet-stream"
            };

            var stream = new FileStream(matchingFile, FileMode.Open, FileAccess.Read);
            return new FileStreamResult(stream, contentType);
        }

        public Comic GetComic(string comicId)
        {
            var comicFolder = Path.Combine(_dataPath, comicId);
            var metadataFile = Path.Combine(comicFolder, "metadata.json");

            if (!File.Exists(metadataFile))
                throw new FileNotFoundException("Comic metadata not found.");

            var json = File.ReadAllText(metadataFile);
            var comic = JsonSerializer.Deserialize<Comic>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                WriteIndented = true
            });

            if (comic == null)
                throw new Exception("Failed to parse comic metadata.");

            return comic;
        }

        public async Task<string> CreateComicFromZipAsync(Comic metadata, IFormFile zipFile)
        {
            metadata.id = Guid.NewGuid().ToString();
            metadata.uploadDate = DateTime.Now;

            var comicFolder = Path.Combine(_dataPath, metadata.id);
            Directory.CreateDirectory(comicFolder);

            // Save zip temporarily
            var tempZipPath = Path.Combine(comicFolder, "temp.zip");
            using (var stream = new FileStream(tempZipPath, FileMode.Create))
            {
                await zipFile.CopyToAsync(stream);
            }

            // Extract
            ZipFile.ExtractToDirectory(tempZipPath, comicFolder);
            File.Delete(tempZipPath);

            // Count pages (assuming files are named like 1.png, 2.jpg etc.)
            var imageFiles = Directory
                .GetFiles(comicFolder)
                .Where(f => Regex.IsMatch(Path.GetFileNameWithoutExtension(f), @"^\d+$"))
                .OrderBy(f => int.Parse(Path.GetFileNameWithoutExtension(f)))
                .ToList();

            metadata.numberOfPages = imageFiles.Count;

            // Save metadata
            var metadataPath = Path.Combine(comicFolder, "metadata.json");
            var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(metadataPath, json);

            return metadata.id;
        }

        public bool DeleteComic(string comicId)
        {
            try
            {
                var comicPath = Path.Combine(_dataPath, comicId);

                if (!Directory.Exists(comicPath))
                    return false;

                Directory.Delete(comicPath, true); // true = recursive delete
                return true;
            }
            catch (Exception ex)
            {
                // Optional: log the exception
                return false;
            }
        }

        public List<Comic> Search(List<string> tags, bool unrestricted)
        {
            if (tags == null || tags.Count == 0)
                return new List<Comic>();

            var catalog = GetCatalog(unrestricted);

            var scoredComics = catalog
                .Select(comic => new
                {
                    Comic = comic,
                    Score = comic.tags.Intersect(tags, StringComparer.OrdinalIgnoreCase).Count()
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Select(x => x.Comic)
                .ToList();

            return scoredComics;
        }

        public int GetTotalComicCount(bool unrestricted)
        {
            return GetCatalog(unrestricted).Count();
        }

        public List<Comic> GetCatalog(bool unrestricted)
        {

            var comics = new List<Comic>();

            if (!Directory.Exists(_dataPath))
                return null;

            var comicFolders = Directory.GetDirectories(_dataPath);

            foreach (var folder in comicFolders)
            {
                var metadataPath = Path.Combine(folder, "metadata.json");

                if (!File.Exists(metadataPath))
                    continue;

                try
                {
                    var json = File.ReadAllText(metadataPath);
                    var comic = JsonSerializer.Deserialize<Comic>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (unrestricted)
                    {
                        if (comic != null)
                        {
                            comics.Add(comic);
                        }
                    } else
                    {
                        if (comic != null
                            && !comic.tags.Any(tag => tag.Equals("unrestricted", StringComparison.OrdinalIgnoreCase)))
                        {
                            comics.Add(comic);
                        }
                    }
                }
                catch
                {
                    // Skip malformed metadata files
                    continue;
                }
            }

            return comics;
        }

        public string CreateComic(Comic metadata, List<IFormFile> pages)
        {
            metadata.id = Guid.NewGuid().ToString();

            try
            {
                // Ensure comics directory exists
                Directory.CreateDirectory(_dataPath);

                // Create a new folder for this comic using the ID
                var comicFolder = Path.Combine(_dataPath, metadata.id);
                Directory.CreateDirectory(comicFolder);

                // Save metadata as comic.json
                var jsonPath = Path.Combine(comicFolder, "metadata.json");
                metadata.uploadDate = DateTime.Now;
                metadata.numberOfPages = pages.Count;

                var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions { WriteIndented = true, PropertyNameCaseInsensitive = true });
                File.WriteAllText(jsonPath, json);

                // Save each image as 1.jpg, 2.jpg, etc.
                for (int i = 0; i < pages.Count; i++)
                {
                    var page = pages[i];
                    var ext = Path.GetExtension(page.FileName).ToLower(); // Keep original extension
                    var imagePath = Path.Combine(comicFolder, $"{i + 1}{ext}");

                    using var stream = new FileStream(imagePath, FileMode.Create);
                    page.CopyTo(stream);
                }

                return metadata.id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving comic: {ex.Message}");
                return "0";
            }
        }
    }
}

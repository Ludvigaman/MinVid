using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MinVid_API.Models;
using System;
using System.Net;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.Json;

namespace MinVid_API.Services
{
    public class VideoService
    {
        private readonly string _dataPath;
        private readonly string _pw; 

        public VideoService(IConfiguration configuration)
        {
            _dataPath = configuration.GetValue<string>("data_path");
            _pw = configuration.GetValue<string>("password");
        }

        public bool Login(string password)
        {
            return (_pw == password);
        }

        public bool Delete(string videoId)
        {
            if (!Directory.Exists(_dataPath))
                return false;

            try
            {
                // Get all files matching the videoId.* pattern
                var matchingFiles = Directory.GetFiles(_dataPath, $"{videoId}.*");

                foreach (var file in matchingFiles)
                {
                    File.Delete(file);
                }

                return matchingFiles.Length > 0;
            }
            catch (Exception ex)
            {
                // Optional: log the error
                Console.WriteLine($"Error deleting files for videoId {videoId}: {ex.Message}");
                return false;
            }
        }

        public FileStream GetVideo(string videoId, string format)
        {
            var fileName = $"{videoId}.{format}";
            var path = Path.Combine(_dataPath, fileName);

            if (!File.Exists(path))
                throw new FileNotFoundException("Video not found");

            return new FileStream(path, FileMode.Open, FileAccess.Read);
        }

        public FileStream GetVideoThumbnail(string videoId)
        {
            var fileName = $"{videoId}.jpg";
            var path = Path.Combine(_dataPath, fileName);

            if (!File.Exists(path))
                throw new FileNotFoundException("Video not found");

            return new FileStream(path, FileMode.Open, FileAccess.Read);
        }

        public VideoMetadata GetVideoMetadata(string id)
        {
            if (!Directory.Exists(_dataPath))
                return null;

            try
            {
                var filePath = Path.Combine(_dataPath, id + ".json");

                if (!File.Exists(filePath))
                    return null;

                var json = File.ReadAllText(filePath);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var videoData = JsonSerializer.Deserialize<VideoMetadata>(json, options);

                return videoData;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading metadata file for ID {id}: {ex.Message}");
                return null;
            }
        }

        public List<VideoMetadata> Search(List<string> tags)
        {

            if (tags == null || tags.Count == 0)
                return new List<VideoMetadata>();

            var catalog = GetVideoMetadataCatalog();

            var scoredVideos = catalog
                .Select(video => new
                {
                    Video = video,
                    // Match score: +1 for each tag match, +2 if title contains the term
                    Score = video.tags.Intersect(tags, StringComparer.OrdinalIgnoreCase).Count()
                            + tags.Count(tag => video.title != null &&
                                                    video.title.IndexOf(tag, StringComparison.OrdinalIgnoreCase) >= 0) * 2
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Take(4)
                .Select(x => x.Video)
                .ToList();

            return scoredVideos;
        }

        public List<VideoMetadata> GetSimilar(string videoId)
        {
            var metadata = GetVideoMetadata(videoId);
            if (metadata == null)
                return new List<VideoMetadata>();

            List<string> tags = metadata.tags;

            if (tags == null || tags.Count == 0)
                return new List<VideoMetadata>();

            var catalog = GetVideoMetadataCatalog();

            var scoredVideos = catalog
                .Where(video => !string.Equals(video.id, videoId, StringComparison.OrdinalIgnoreCase)) // Exclude self
                .Select(video => new
                {
                    Video = video,
                    Score = video.tags.Intersect(tags, StringComparer.OrdinalIgnoreCase).Count()
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Take(4)
                .Select(x => x.Video)
                .ToList();

            return scoredVideos;
        }

        public List<VideoMetadata> GetWithTag(string tag)
        {
            if (string.IsNullOrWhiteSpace(tag))
                return new List<VideoMetadata>();

            var catalog = GetVideoMetadataCatalog();

            var matchedVideos = catalog
                .Where(video => video.tags.Any(t => string.Equals(t, tag, StringComparison.OrdinalIgnoreCase)))
                .OrderByDescending(video => video.uploadDate) // Sort by upload date (newest first)
                .ToList();

            return matchedVideos;
        }


        public List<VideoMetadata> GetVideoMetadataCatalog()
        {
            var videos = new List<VideoMetadata>();

            if (!Directory.Exists(_dataPath))
                return videos;

            var jsonFiles = Directory.GetFiles(_dataPath, "*.json");

            foreach (var file in jsonFiles)
            {
                try
                {
                    var json = File.ReadAllText(file);

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var metadata = JsonSerializer.Deserialize<VideoMetadata>(json, options);
                    if (metadata != null)
                        videos.Add(metadata);
                }
                catch (Exception ex)
                {
                    // Optional: log the error
                    Console.WriteLine($"Error reading file {file}: {ex.Message}");
                }
            }

            return videos;
        }

        public List<VideoMetadata> GetVideoMetadataCatalogCount(int amount)
        {
            var videos = new List<VideoMetadata>();

            if (!Directory.Exists(_dataPath))
                return videos;

            var jsonFiles = Directory.GetFiles(_dataPath, "*.json")
                                     .OrderByDescending(file => File.GetLastWriteTime(file)) 
                                     .Take(amount); 

            foreach (var file in jsonFiles)
            {
                try
                {
                    var json = File.ReadAllText(file);

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var metadata = JsonSerializer.Deserialize<VideoMetadata>(json, options);
                    if (metadata != null)
                        videos.Add(metadata);
                }
                catch (Exception ex)
                {
                    // Optional: log the error
                    Console.WriteLine($"Error reading file {file}: {ex.Message}");
                }
            }

            return videos;
        }


        public async Task<string> SaveVideoAsync(IFormFile videoFile, string metadataJson)
        {
            var metadata = JsonSerializer.Deserialize<VideoMetadata>(metadataJson, new JsonSerializerOptions { WriteIndented = true, PropertyNameCaseInsensitive = true })
                           ?? throw new Exception("Invalid metadata");

            metadata.id = Guid.NewGuid().ToString();
            metadata.uploadDate = DateTime.Now;
            metadata.format = Path.GetExtension(videoFile.FileName).TrimStart('.').ToLowerInvariant();

            var videoPath = Path.Combine(_dataPath, $"{metadata.id}.{metadata.format}");
            var metadataPath = Path.Combine(_dataPath, $"{metadata.id}.json");
            var thumbnailPath = Path.Combine(_dataPath, metadata.id + ".jpg");

            Directory.CreateDirectory(Path.GetDirectoryName(videoPath)!);
            Directory.CreateDirectory(Path.GetDirectoryName(metadataPath)!);

            using (var stream = new FileStream(videoPath, FileMode.Create))
            {
                await videoFile.CopyToAsync(stream);
            }

            var metadataOut = JsonSerializer.Serialize(metadata, new JsonSerializerOptions { WriteIndented = true, PropertyNameCaseInsensitive = true });
            await File.WriteAllTextAsync(metadataPath, metadataOut);

            var ffmpegPath = Path.Combine(AppContext.BaseDirectory, "Utils", "ffmpeg.exe");

            var ffmpegProcess = new System.Diagnostics.Process();
            ffmpegProcess.StartInfo.FileName = ffmpegPath;
            ffmpegProcess.StartInfo.Arguments = $"-i \"{videoPath}\" -ss 00:00:04 -vframes 1 \"{thumbnailPath}\"";
            ffmpegProcess.StartInfo.UseShellExecute = false;
            ffmpegProcess.StartInfo.CreateNoWindow = true;
            ffmpegProcess.StartInfo.RedirectStandardError = true;
            ffmpegProcess.Start();

            string output = await ffmpegProcess.StandardError.ReadToEndAsync(); // Useful for debugging
            ffmpegProcess.WaitForExit();

            return metadata.id.ToString();
        }


    }
}

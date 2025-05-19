using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MinVid_API.Models;
using System;
using System.Net;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.Json;
using System.Globalization;
using System.Text.RegularExpressions;

namespace MinVid_API.Services
{
    public class VideoService
    {
        private readonly string _dataPath;
        private readonly ImageService _imageService;
        private readonly string _importPath;
        private readonly string _pw; 

        public VideoService(IConfiguration configuration, ImageService imgService)
        {
            _dataPath = configuration.GetValue<string>("data_path");
            _imageService = imgService;
            _importPath = _dataPath + "\\import";
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

        public List<string> GetTagList()
        {
            var imageCatalog = _imageService.GetImageCatalog();
            var catalog = GetVideoMetadataCatalog();

            if (catalog.Count == 0 && imageCatalog.Count == 0)
                return new List<string>();

            var tagList = new List<string>();

            foreach (var meta in catalog)
            {
                if (meta.tags == null) continue;

                foreach (var tag in meta.tags)
                {
                    var trimmedTag = tag.Trim();
                    if (!tagList.Contains(trimmedTag, StringComparer.OrdinalIgnoreCase))
                    {
                        tagList.Add(trimmedTag);
                    }
                }
            }

            foreach (var img in imageCatalog)
            {
                if(img.tags == null) continue;

                foreach(var tag in img.tags)
                {
                    var trimmedTag = tag.Trim();
                    if (!tagList.Contains(trimmedTag, StringComparer.OrdinalIgnoreCase))
                    {
                        tagList.Add(trimmedTag);
                    }
                }
            }

            return tagList;
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

            var ffmpegPath = GetFFmpegPath();

            var ffmpegProcess = new System.Diagnostics.Process
            {
                StartInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = ffmpegPath,
                    Arguments = $"-i \"{videoPath}\" -ss 00:00:04 -vframes 1 \"{thumbnailPath}\"",
                    UseShellExecute = false,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            ffmpegProcess.Start();
            string output = await ffmpegProcess.StandardError.ReadToEndAsync();
            ffmpegProcess.WaitForExit();

            // 🔍 Parse duration from stderr
            var durationMatch = Regex.Match(output, @"Duration: (\d+):(\d+):(\d+.\d+)");
            if (durationMatch.Success)
            {
                var hours = int.Parse(durationMatch.Groups[1].Value);
                var minutes = int.Parse(durationMatch.Groups[2].Value);
                var seconds = double.Parse(durationMatch.Groups[3].Value, CultureInfo.InvariantCulture);

                metadata.duration = (int)(hours * 3600 + minutes * 60 + seconds);
            }

            // 💾 Save metadata JSON
            var metadataOut = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNameCaseInsensitive = true
            });
            await File.WriteAllTextAsync(metadataPath, metadataOut);

            return metadata.id.ToString();
        }

        public async Task<bool> SaveThumbnailAsync(string videoId, IFormFile thumbnail)
        {
            var thumbnailPath = Path.Combine(_dataPath, $"{videoId}.jpg");

            using (var stream = new FileStream(thumbnailPath, FileMode.Create))
            {
                await thumbnail.CopyToAsync(stream);
                return true;
            }
        }

        public async Task<bool> UpdateMetadataAsync(VideoMetadata updatedData)
        {
            string metadataPath = Path.Combine(_dataPath, $"{updatedData.id}.json");

            if (!File.Exists(metadataPath))
                return false; // Metadata file not found

            try
            {
                // Load the existing metadata
                var existingJson = await File.ReadAllTextAsync(metadataPath);
                var existingMetadata = JsonSerializer.Deserialize<VideoMetadata>(existingJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (existingMetadata == null)
                    return false;

                existingMetadata.title = updatedData.title ?? existingMetadata.title;
                existingMetadata.description = updatedData.description ?? existingMetadata.description;
                existingMetadata.tags = updatedData.tags ?? existingMetadata.tags;
                existingMetadata.format = updatedData.format ?? existingMetadata.format;

                var newJson = JsonSerializer.Serialize(existingMetadata, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(metadataPath, newJson);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating metadata: {ex.Message}");
                return false;
            }
        }


        public async Task<List<string>> InitializeUnprocessedVideos()
        {
            string stagingPath = _importPath;
            Directory.CreateDirectory(stagingPath);

            string libraryPath = _dataPath;

            var videoFiles = Directory.GetFiles(stagingPath, "*.*")
                .Where(f => f.EndsWith(".mp4") || f.EndsWith(".mov") || f.EndsWith(".avi")) // Add formats as needed
                .ToList();

            var initializedIds = new List<string>();

            foreach (var videoFile in videoFiles)
            {
                var newId = Guid.NewGuid().ToString();
                var format = Path.GetExtension(videoFile).TrimStart('.');
                var newFileName = $"{newId}.{format}";
                var newPath = Path.Combine(libraryPath, newFileName);

                File.Move(videoFile, newPath);

                var metadata = new VideoMetadata
                {
                    id = newId,
                    title = Path.GetFileNameWithoutExtension(videoFile),
                    description = "Imported video",
                    tags = new List<string> { "non-indexed" },
                    uploadDate = DateTime.Now,
                    format = format
                };

                var thumbnailPath = Path.Combine(_dataPath, metadata.id + ".jpg");
                var ffmpegPath = GetFFmpegPath();

                var ffmpegProcess = new System.Diagnostics.Process
                {
                    StartInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = ffmpegPath,
                        Arguments = $"-i \"{newPath}\" -ss 00:00:04 -vframes 1 \"{thumbnailPath}\"",
                        UseShellExecute = false,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };

                ffmpegProcess.Start();
                string output = await ffmpegProcess.StandardError.ReadToEndAsync();
                ffmpegProcess.WaitForExit();

                // 🧠 Extract duration
                var durationMatch = Regex.Match(output, @"Duration: (\d+):(\d+):(\d+\.\d+)");
                if (durationMatch.Success)
                {
                    int hours = int.Parse(durationMatch.Groups[1].Value);
                    int minutes = int.Parse(durationMatch.Groups[2].Value);
                    double seconds = double.Parse(durationMatch.Groups[3].Value, CultureInfo.InvariantCulture);

                    metadata.duration = (int)(hours * 3600 + minutes * 60 + seconds);
                }

                // 💾 Save metadata
                var metadataJson = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNameCaseInsensitive = true
                });

                await File.WriteAllTextAsync(Path.Combine(libraryPath, newId + ".json"), metadataJson);

                initializedIds.Add(newId);
            }

            return initializedIds;
        }

        private string GetFFmpegPath()
        {
            if (OperatingSystem.IsWindows())
            {
                return Path.Combine(AppContext.BaseDirectory, "Utils", "ffmpeg.exe");
            }
            else if (OperatingSystem.IsLinux() || OperatingSystem.IsMacOS())
            {
                return "ffmpeg"; // Assumes installed and on PATH
            }
            else
            {
                throw new PlatformNotSupportedException("Unsupported OS platform for ffmpeg.");
            }
        }


    }
}

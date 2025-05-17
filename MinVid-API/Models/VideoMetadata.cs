namespace MinVid_API.Models
{
    public class VideoMetadata
    {
        public string id { get; set; }
        public string title { get; set; }
        public string format { get; set; }
        public string description { get; set; } 
        public List<string> tags { get; set; }
        public DateTime uploadDate { get; set; }
        public int duration { get; set; }
    }
}

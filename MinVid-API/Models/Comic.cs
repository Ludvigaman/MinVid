namespace MinVid_API.Models
{
    public class Comic
    {
        public string id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string artist { get; set; }
        public int numberOfPages { get; set; }
        public List<string> tags { get; set; }
        public DateTime uploadDate { get; set; }
    }
}

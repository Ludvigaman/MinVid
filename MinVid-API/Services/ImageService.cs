namespace MinVid_API.Services
{
    public class ImageService
    {
        private readonly string _dataPath;

        public ImageService(IConfiguration configuration)
        {
            _dataPath = configuration.GetValue<string>("image_data_path");
        }

    }
}

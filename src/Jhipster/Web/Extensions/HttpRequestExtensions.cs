using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Jhipster.Web.Extensions
{
    public static class HttpRequestExtensions
    {
        public static async Task<string> BodyAsStringAsync(this HttpRequest request, Encoding encoding = null)
        {
            if (encoding == null) encoding = Encoding.UTF8;

            using (var reader = new StreamReader(request.Body, encoding))
            {
                return await reader.ReadToEndAsync();
            }
        }
    }
}

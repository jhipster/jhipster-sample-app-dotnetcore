using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<Category> Save(Category category);

        Task<IPage<Category>> FindAll(IPageable pageable, string query);

        Task<Category> FindOne(long id);

        Task Delete(long id);
    }
}

using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<Department> Save(Department department);

        Task<IPage<Department>> FindAll(IPageable pageable);

        Task<Department> FindOne(long id);

        Task Delete(long id);
    }
}

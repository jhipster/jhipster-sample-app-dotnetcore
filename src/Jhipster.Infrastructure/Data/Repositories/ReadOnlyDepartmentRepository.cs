using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class ReadOnlyDepartmentRepository : ReadOnlyGenericRepository<Department, long>, IReadOnlyDepartmentRepository
    {
        public ReadOnlyDepartmentRepository(IUnitOfWork context) : base(context)
        {
        }
    }
}

using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Department> CreateOrUpdateAsync(Department department)
        {
            bool exists = await Exists(x => x.Id == department.Id);

            if (department.Id != 0 && exists)
            {
                Update(department);
            }
            else
            {
                _context.AddOrUpdateGraph(department);
            }
            return department;
        }
    }
}

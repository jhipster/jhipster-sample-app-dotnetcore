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

            if (department.Id != 0 && exists) {
                Update(department);
                /* Force the reference navigation property to be in "modified" state.
                This allows to modify it with a null value (the field is nullable).
                This takes into consideration the case of removing the association between the two instances. */
                _context.SetEntityStateModified(department, department0 => department0.Location);
            } else {
                _context.AddGraph(department);
            }

            return department;
        }
    }
}

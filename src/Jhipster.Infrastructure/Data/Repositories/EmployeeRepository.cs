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
    public class EmployeeRepository : GenericRepository<Employee>, IEmployeeRepository
    {
        public EmployeeRepository(IUnitOfWork context) : base(context) 
        {
        }

        public override async Task<Employee> CreateOrUpdateAsync(Employee employee)
        {
            bool exists = await Exists(x => x.Id == employee.Id);

            if (employee.Id != 0 && exists) {
                Update(employee);
                /* Force the reference navigation property to be in "modified" state.
                This allows to modify it with a null value (the field is nullable).
                This takes into consideration the case of removing the association between the two instances. */
                _context.SetEntityStateModified(employee, employee0 => employee0.Manager);
                _context.SetEntityStateModified(employee, employee0 => employee0.Department);
            } else {
                _context.AddGraph(employee);
            }

            return employee;
        }
    }
}

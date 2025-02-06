using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using JhipsterSampleApplication.Infrastructure.Data.Extensions;

namespace JhipsterSampleApplication.Infrastructure.Data.Repositories
{
    public class ReadOnlyEmployeeRepository : ReadOnlyGenericRepository<Employee, long?>, IReadOnlyEmployeeRepository
    {
        public ReadOnlyEmployeeRepository(IUnitOfWork context) : base(context)
        {
        }
    }
}

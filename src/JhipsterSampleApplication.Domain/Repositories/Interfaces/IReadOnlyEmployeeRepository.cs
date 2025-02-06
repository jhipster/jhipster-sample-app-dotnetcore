
using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyEmployeeRepository : IReadOnlyGenericRepository<Employee, long?>
    {
    }

}


using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyDepartmentRepository : IReadOnlyGenericRepository<Department, long?>
    {
    }

}

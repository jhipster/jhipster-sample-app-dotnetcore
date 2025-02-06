using JhipsterSampleApplication.Domain.Entities;
using System;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{
    public interface ITimeSheetEntryRepository : IGenericRepository<TimeSheetEntry, long?>
    {
    }
}

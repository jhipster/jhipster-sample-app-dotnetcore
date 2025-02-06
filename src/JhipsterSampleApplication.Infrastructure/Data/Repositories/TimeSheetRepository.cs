using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using JhipsterSampleApplication.Infrastructure.Data.Extensions;

namespace JhipsterSampleApplication.Infrastructure.Data.Repositories
{
    public class TimeSheetRepository : GenericRepository<TimeSheet, Guid?>, ITimeSheetRepository
    {
        public TimeSheetRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<TimeSheet> CreateOrUpdateAsync(TimeSheet timeSheet)
        {
            List<Type> entitiesToBeUpdated = new List<Type>();
            return await base.CreateOrUpdateAsync(timeSheet, entitiesToBeUpdated);
        }
    }
}

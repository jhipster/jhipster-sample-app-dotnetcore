using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class JobHistoryRepository : GenericRepository<JobHistory, long>, IJobHistoryRepository
    {
        public JobHistoryRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<JobHistory> CreateOrUpdateAsync(JobHistory jobHistory)
        {
            List<Type> entitiesToBeUpdated = new List<Type>();
            return await base.CreateOrUpdateAsync(jobHistory, entitiesToBeUpdated);
        }
    }
}

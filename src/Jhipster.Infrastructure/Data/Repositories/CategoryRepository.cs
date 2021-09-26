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
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Category> CreateOrUpdateAsync(Category category)
        {
            bool exists = await Exists(x => x.Id == category.Id);

            if (category.Id != 0 && exists)
            {
                Update(category);
            }
            else
            {
                _context.AddOrUpdateGraph(category);
            }
            return category;
        }
    }
}

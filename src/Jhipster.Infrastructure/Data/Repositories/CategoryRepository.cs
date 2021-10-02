using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;
using Jhipster.Infrastructure.Data;
using System.Collections.Generic;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        protected readonly IBirthdayRepository _birthdayRepository;   
        public CategoryRepository(IUnitOfWork context, IBirthdayRepository birthdayRepository) : base(context)
        {
            _birthdayRepository = birthdayRepository;
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
        public override async Task<IPage<Category>> GetPageFilteredAsync(IPageable pageable, string query){
            IPage<Birthday> birthdayPage = await _birthdayRepository.GetPageFilteredAsync(pageable, "categories:*");
            List<Category> content = new List<Category>();
            ((List<Birthday>)birthdayPage.Content).ForEach(b=>{
                if (b.Categories != null){
                    b.Categories.ForEach(c =>{
                        content.Add(new Category{
                            CategoryName = c.CategoryName,
                            selected = b.Id == query
                        });
                    });
                }
            });
            return new Page<Category>(content, pageable, content.Count);
        }
    }
}

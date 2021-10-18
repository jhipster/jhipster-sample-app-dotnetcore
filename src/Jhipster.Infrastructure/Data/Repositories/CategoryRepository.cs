using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;
using System;
using Nest;
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
            IPage<Birthday> birthdayPage = await _birthdayRepository.GetPageFilteredAsync(pageable, query);
            List<Category> content = new List<Category>();
            Dictionary<string, bool> encountered = new Dictionary<string, bool>();
            long id = 0;
            ((List<Birthday>)birthdayPage.Content).ForEach(b=>{
                if (b.Categories != null){
                    b.Categories.ForEach(c =>{
                        if (!encountered.ContainsKey(c.CategoryName)){
                            content.Add(new Category{
                                CategoryName = c.CategoryName,
                                selected = b.Id == query,
                                Id = ++id // arbitrary id to distinguish rows
                            });
                            encountered[c.CategoryName] = true;
                        }
                    });
                }
            });
            content = content.OrderBy(cat => cat.CategoryName).ToList();
            content.Add(new Category{
                CategoryName = "(Uncategorized)",
                selected = false,
                notCategorized = true
            });
            return new Page<Category>(content, pageable, content.Count);
        }
    }
}

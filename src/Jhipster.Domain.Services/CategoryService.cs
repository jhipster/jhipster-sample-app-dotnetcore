using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Services
{
    public class CategoryService : ICategoryService
    {
        protected readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public virtual async Task<Category> Save(Category category)
        {
            await _categoryRepository.CreateOrUpdateAsync(category);
            await _categoryRepository.SaveChangesAsync();
            return category;
        }

        public virtual async Task<IPage<Category>> FindAll(IPageable pageable, string query)
        {
            var page = await _categoryRepository.GetPageFilteredAsync(pageable, query);
            return page;
        }

        public virtual async Task<Category> FindOne(long id)
        {
            var result = await _categoryRepository.QueryHelper()
                .GetOneAsync(category => category.Id == id);
            return result;
        }

        public virtual async Task Delete(long id)
        {
            await _categoryRepository.DeleteByIdAsync(id);
            await _categoryRepository.SaveChangesAsync();
        }
    }
}

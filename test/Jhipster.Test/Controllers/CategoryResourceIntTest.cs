
using AutoMapper;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Jhipster.Infrastructure.Data;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Dto;
using Jhipster.Configuration.AutoMapper;
using Jhipster.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Jhipster.Test.Controllers
{
    public class CategoryResourceIntTest
    {
        public CategoryResourceIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _categoryRepository = _factory.GetRequiredService<ICategoryRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });

            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultCategoryName = "AAAAAAAAAA";
        private const string UpdatedCategoryName = "BBBBBBBBBB";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly ICategoryRepository _categoryRepository;

        private Category _category;

        private readonly IMapper _mapper;

        private Category CreateEntity()
        {
            return new Category
            {
                CategoryName = DefaultCategoryName
            };
        }

        private void InitTest()
        {
            _category = CreateEntity();
        }

        [Fact]
        public async Task CreateCategory()
        {
            var databaseSizeBeforeCreate = await _categoryRepository.CountAsync();

            // Create the Category
            CategoryDto _categoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PostAsync("/api/categories", TestUtil.ToJsonContent(_categoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testCategory = categoryList.Last();
            testCategory.CategoryName.Should().Be(DefaultCategoryName);
        }

        [Fact]
        public async Task CreateCategoryWithExistingId()
        {
            var databaseSizeBeforeCreate = await _categoryRepository.CountAsync();
            databaseSizeBeforeCreate.Should().Be(0);
            // Create the Category with an existing ID
            _category.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            CategoryDto _categoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PostAsync("/api/categories", TestUtil.ToJsonContent(_categoryDto));

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllCategories()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();

            // Get all the categoryList
            var response = await _client.GetAsync("/api/categories?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_category.Id);
            json.SelectTokens("$.[*].categoryName").Should().Contain(DefaultCategoryName);
        }

        [Fact]
        public async Task GetCategory()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();

            // Get the category
            var response = await _client.GetAsync($"/api/categories/{_category.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_category.Id);
            json.SelectTokens("$.categoryName").Should().Contain(DefaultCategoryName);
        }

        [Fact]
        public async Task GetNonExistingCategory()
        {
            var response = await _client.GetAsync("/api/categories/" + long.MaxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateCategory()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _categoryRepository.CountAsync();

            // Update the category
            var updatedCategory = await _categoryRepository.QueryHelper().GetOneAsync(it => it.Id == _category.Id);
            // Disconnect from session so that the updates on updatedCategory are not directly saved in db
            //TODO detach
            updatedCategory.CategoryName = UpdatedCategoryName;

            CategoryDto updatedCategoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PutAsync("/api/categories", TestUtil.ToJsonContent(updatedCategoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testCategory = categoryList.Last();
            testCategory.CategoryName.Should().Be(UpdatedCategoryName);
        }

        [Fact]
        public async Task UpdateNonExistingCategory()
        {
            var databaseSizeBeforeUpdate = await _categoryRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            CategoryDto _categoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PutAsync("/api/categories", TestUtil.ToJsonContent(_categoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteCategory()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _categoryRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/categories/{_category.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the database is empty
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Category));
            var category1 = new Category
            {
                Id = 1L
            };
            var category2 = new Category
            {
                Id = category1.Id
            };
            category1.Should().Be(category2);
            category2.Id = 2L;
            category1.Should().NotBe(category2);
            category1.Id = 0;
            category1.Should().NotBe(category2);
        }
    }
}


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
    public class DepartmentResourceIntTest
    {
        public DepartmentResourceIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _departmentRepository = _factory.GetRequiredService<IDepartmentRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });

            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultDepartmentName = "AAAAAAAAAA";
        private const string UpdatedDepartmentName = "BBBBBBBBBB";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IDepartmentRepository _departmentRepository;

        private Department _department;

        private readonly IMapper _mapper;

        private Department CreateEntity()
        {
            return new Department
            {
                DepartmentName = DefaultDepartmentName
            };
        }

        private void InitTest()
        {
            _department = CreateEntity();
        }

        [Fact]
        public async Task CreateDepartment()
        {
            var databaseSizeBeforeCreate = await _departmentRepository.CountAsync();

            // Create the Department
            DepartmentDto _departmentDto = _mapper.Map<DepartmentDto>(_department);
            var response = await _client.PostAsync("/api/departments", TestUtil.ToJsonContent(_departmentDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Department in the database
            var departmentList = await _departmentRepository.GetAllAsync();
            departmentList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testDepartment = departmentList.Last();
            testDepartment.DepartmentName.Should().Be(DefaultDepartmentName);
        }

        [Fact]
        public async Task CreateDepartmentWithExistingId()
        {
            var databaseSizeBeforeCreate = await _departmentRepository.CountAsync();
            databaseSizeBeforeCreate.Should().Be(0);
            // Create the Department with an existing ID
            _department.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            DepartmentDto _departmentDto = _mapper.Map<DepartmentDto>(_department);
            var response = await _client.PostAsync("/api/departments", TestUtil.ToJsonContent(_departmentDto));

            // Validate the Department in the database
            var departmentList = await _departmentRepository.GetAllAsync();
            departmentList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task CheckDepartmentNameIsRequired()
        {
            var databaseSizeBeforeTest = await _departmentRepository.CountAsync();

            // Set the field to null
            _department.DepartmentName = null;

            // Create the Department, which fails.
            DepartmentDto _departmentDto = _mapper.Map<DepartmentDto>(_department);
            var response = await _client.PostAsync("/api/departments", TestUtil.ToJsonContent(_departmentDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            var departmentList = await _departmentRepository.GetAllAsync();
            departmentList.Count().Should().Be(databaseSizeBeforeTest);
        }

        [Fact]
        public async Task GetAllDepartments()
        {
            // Initialize the database
            await _departmentRepository.CreateOrUpdateAsync(_department);
            await _departmentRepository.SaveChangesAsync();

            // Get all the departmentList
            var response = await _client.GetAsync("/api/departments?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_department.Id);
            json.SelectTokens("$.[*].departmentName").Should().Contain(DefaultDepartmentName);
        }

        [Fact]
        public async Task GetDepartment()
        {
            // Initialize the database
            await _departmentRepository.CreateOrUpdateAsync(_department);
            await _departmentRepository.SaveChangesAsync();

            // Get the department
            var response = await _client.GetAsync($"/api/departments/{_department.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_department.Id);
            json.SelectTokens("$.departmentName").Should().Contain(DefaultDepartmentName);
        }

        [Fact]
        public async Task GetNonExistingDepartment()
        {
            var response = await _client.GetAsync("/api/departments/" + long.MaxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateDepartment()
        {
            // Initialize the database
            await _departmentRepository.CreateOrUpdateAsync(_department);
            await _departmentRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _departmentRepository.CountAsync();

            // Update the department
            var updatedDepartment = await _departmentRepository.QueryHelper().GetOneAsync(it => it.Id == _department.Id);
            // Disconnect from session so that the updates on updatedDepartment are not directly saved in db
            //TODO detach
            updatedDepartment.DepartmentName = UpdatedDepartmentName;

            DepartmentDto updatedDepartmentDto = _mapper.Map<DepartmentDto>(_department);
            var response = await _client.PutAsync("/api/departments", TestUtil.ToJsonContent(updatedDepartmentDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Department in the database
            var departmentList = await _departmentRepository.GetAllAsync();
            departmentList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testDepartment = departmentList.Last();
            testDepartment.DepartmentName.Should().Be(UpdatedDepartmentName);
        }

        [Fact]
        public async Task UpdateNonExistingDepartment()
        {
            var databaseSizeBeforeUpdate = await _departmentRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            DepartmentDto _departmentDto = _mapper.Map<DepartmentDto>(_department);
            var response = await _client.PutAsync("/api/departments", TestUtil.ToJsonContent(_departmentDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Department in the database
            var departmentList = await _departmentRepository.GetAllAsync();
            departmentList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteDepartment()
        {
            // Initialize the database
            await _departmentRepository.CreateOrUpdateAsync(_department);
            await _departmentRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _departmentRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/departments/{_department.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the database is empty
            var departmentList = await _departmentRepository.GetAllAsync();
            departmentList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Department));
            var department1 = new Department
            {
                Id = 1L
            };
            var department2 = new Department
            {
                Id = department1.Id
            };
            department1.Should().Be(department2);
            department2.Id = 2L;
            department1.Should().NotBe(department2);
            department1.Id = 0;
            department1.Should().NotBe(department2);
        }
    }
}

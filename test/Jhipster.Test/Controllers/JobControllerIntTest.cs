
using AutoMapper;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Jhipster.Infrastructure.Data;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Dto;
using Jhipster.Configuration.AutoMapper;
using Jhipster.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Jhipster.Test.Controllers
{
    public class JobsControllerIntTest
    {
        public JobsControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _jobRepository = _factory.GetRequiredService<IJobRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultJobTitle = "AAAAAAAAAA";
        private const string UpdatedJobTitle = "BBBBBBBBBB";

        private static readonly long? DefaultMinSalary = 1L;
        private static readonly long? UpdatedMinSalary = 2L;

        private static readonly long? DefaultMaxSalary = 1L;
        private static readonly long? UpdatedMaxSalary = 2L;

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IJobRepository _jobRepository;

        private Job _job;

        private readonly IMapper _mapper;

        private Job CreateEntity()
        {
            return new Job
            {
                JobTitle = DefaultJobTitle,
                MinSalary = DefaultMinSalary,
                MaxSalary = DefaultMaxSalary,
            };
        }

        private void InitTest()
        {
            _job = CreateEntity();
        }

        [Fact]
        public async Task CreateJob()
        {
            var databaseSizeBeforeCreate = await _jobRepository.CountAsync();

            // Create the Job
            JobDto _jobDto = _mapper.Map<JobDto>(_job);
            var response = await _client.PostAsync("/api/jobs", TestUtil.ToJsonContent(_jobDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Job in the database
            var jobList = await _jobRepository.GetAllAsync();
            jobList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testJob = jobList.Last();
            testJob.JobTitle.Should().Be(DefaultJobTitle);
            testJob.MinSalary.Should().Be(DefaultMinSalary);
            testJob.MaxSalary.Should().Be(DefaultMaxSalary);
        }

        [Fact]
        public async Task CreateJobWithExistingId()
        {
            var databaseSizeBeforeCreate = await _jobRepository.CountAsync();
            // Create the Job with an existing ID
            _job.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            JobDto _jobDto = _mapper.Map<JobDto>(_job);
            var response = await _client.PostAsync("/api/jobs", TestUtil.ToJsonContent(_jobDto));

            // Validate the Job in the database
            var jobList = await _jobRepository.GetAllAsync();
            jobList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllJobs()
        {
            // Initialize the database
            await _jobRepository.CreateOrUpdateAsync(_job);
            await _jobRepository.SaveChangesAsync();

            // Get all the jobList
            var response = await _client.GetAsync("/api/jobs?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_job.Id);
            json.SelectTokens("$.[*].jobTitle").Should().Contain(DefaultJobTitle);
            json.SelectTokens("$.[*].minSalary").Should().Contain(DefaultMinSalary);
            json.SelectTokens("$.[*].maxSalary").Should().Contain(DefaultMaxSalary);
        }

        [Fact]
        public async Task GetJob()
        {
            // Initialize the database
            await _jobRepository.CreateOrUpdateAsync(_job);
            await _jobRepository.SaveChangesAsync();

            // Get the job
            var response = await _client.GetAsync($"/api/jobs/{_job.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_job.Id);
            json.SelectTokens("$.jobTitle").Should().Contain(DefaultJobTitle);
            json.SelectTokens("$.minSalary").Should().Contain(DefaultMinSalary);
            json.SelectTokens("$.maxSalary").Should().Contain(DefaultMaxSalary);
        }

        [Fact]
        public async Task GetNonExistingJob()
        {
            var maxValue = long.MaxValue;
            var response = await _client.GetAsync("/api/jobs/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateJob()
        {
            // Initialize the database
            await _jobRepository.CreateOrUpdateAsync(_job);
            await _jobRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _jobRepository.CountAsync();

            // Update the job
            var updatedJob = await _jobRepository.QueryHelper().GetOneAsync(it => it.Id == _job.Id);
            // Disconnect from session so that the updates on updatedJob are not directly saved in db
            //TODO detach
            updatedJob.JobTitle = UpdatedJobTitle;
            updatedJob.MinSalary = UpdatedMinSalary;
            updatedJob.MaxSalary = UpdatedMaxSalary;

            JobDto updatedJobDto = _mapper.Map<JobDto>(updatedJob);
            var response = await _client.PutAsync($"/api/jobs/{_job.Id}", TestUtil.ToJsonContent(updatedJobDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Job in the database
            var jobList = await _jobRepository.GetAllAsync();
            jobList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testJob = jobList.Last();
            testJob.JobTitle.Should().Be(UpdatedJobTitle);
            testJob.MinSalary.Should().Be(UpdatedMinSalary);
            testJob.MaxSalary.Should().Be(UpdatedMaxSalary);
        }

        [Fact]
        public async Task UpdateNonExistingJob()
        {
            var databaseSizeBeforeUpdate = await _jobRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            JobDto _jobDto = _mapper.Map<JobDto>(_job);
            var response = await _client.PutAsync("/api/jobs/1", TestUtil.ToJsonContent(_jobDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Job in the database
            var jobList = await _jobRepository.GetAllAsync();
            jobList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteJob()
        {
            // Initialize the database
            await _jobRepository.CreateOrUpdateAsync(_job);
            await _jobRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _jobRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/jobs/{_job.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Validate the database is empty
            var jobList = await _jobRepository.GetAllAsync();
            jobList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Job));
            var job1 = new Job
            {
                Id = 1L
            };
            var job2 = new Job
            {
                Id = job1.Id
            };
            job1.Should().Be(job2);
            job2.Id = 2L;
            job1.Should().NotBe(job2);
            job1.Id = 0;
            job1.Should().NotBe(job2);
        }
    }
}

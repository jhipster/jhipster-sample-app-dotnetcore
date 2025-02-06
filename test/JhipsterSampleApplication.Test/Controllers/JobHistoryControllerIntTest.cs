
using AutoMapper;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using FluentAssertions.Extensions;
using JhipsterSampleApplication.Infrastructure.Data;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using JhipsterSampleApplication.Crosscutting.Enums;
using JhipsterSampleApplication.Dto;
using JhipsterSampleApplication.Configuration.AutoMapper;
using JhipsterSampleApplication.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace JhipsterSampleApplication.Test.Controllers
{
    public class JobHistoriesControllerIntTest
    {
        public JobHistoriesControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _jobHistoryRepository = _factory.GetRequiredService<IJobHistoryRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private static readonly DateTime DefaultStartDate = DateTime.UnixEpoch;
        private static readonly DateTime UpdatedStartDate = DateTime.UtcNow;

        private static readonly DateTime DefaultEndDate = DateTime.UnixEpoch;
        private static readonly DateTime UpdatedEndDate = DateTime.UtcNow;

        private const Language DefaultLanguage = Language.ENGLISH;
        private const Language UpdatedLanguage = Language.ENGLISH;

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IJobHistoryRepository _jobHistoryRepository;

        private JobHistory _jobHistory;

        private readonly IMapper _mapper;

        private JobHistory CreateEntity()
        {
            return new JobHistory
            {
                StartDate = DefaultStartDate,
                EndDate = DefaultEndDate,
                Language = DefaultLanguage,
            };
        }

        private void InitTest()
        {
            _jobHistory = CreateEntity();
        }

        [Fact]
        public async Task CreateJobHistory()
        {
            var databaseSizeBeforeCreate = await _jobHistoryRepository.CountAsync();

            // Create the JobHistory
            JobHistoryDto _jobHistoryDto = _mapper.Map<JobHistoryDto>(_jobHistory);
            var response = await _client.PostAsync("/api/job-histories", TestUtil.ToJsonContent(_jobHistoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the JobHistory in the database
            var jobHistoryList = await _jobHistoryRepository.GetAllAsync();
            jobHistoryList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testJobHistory = jobHistoryList.Last();
            testJobHistory.StartDate.Should().Be(DefaultStartDate);
            testJobHistory.EndDate.Should().Be(DefaultEndDate);
            testJobHistory.Language.Should().Be(DefaultLanguage);
        }

        [Fact]
        public async Task CreateJobHistoryWithExistingId()
        {
            var databaseSizeBeforeCreate = await _jobHistoryRepository.CountAsync();
            // Create the JobHistory with an existing ID
            _jobHistory.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            JobHistoryDto _jobHistoryDto = _mapper.Map<JobHistoryDto>(_jobHistory);
            var response = await _client.PostAsync("/api/job-histories", TestUtil.ToJsonContent(_jobHistoryDto));

            // Validate the JobHistory in the database
            var jobHistoryList = await _jobHistoryRepository.GetAllAsync();
            jobHistoryList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllJobHistories()
        {
            // Initialize the database
            await _jobHistoryRepository.CreateOrUpdateAsync(_jobHistory);
            await _jobHistoryRepository.SaveChangesAsync();

            // Get all the jobHistoryList
            var response = await _client.GetAsync("/api/job-histories?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_jobHistory.Id);
            json.SelectTokens("$.[*].startDate").Should().Contain(DefaultStartDate);
            json.SelectTokens("$.[*].endDate").Should().Contain(DefaultEndDate);
            json.SelectTokens("$.[*].language").Should().Contain(DefaultLanguage.ToString());
        }

        [Fact]
        public async Task GetJobHistory()
        {
            // Initialize the database
            await _jobHistoryRepository.CreateOrUpdateAsync(_jobHistory);
            await _jobHistoryRepository.SaveChangesAsync();

            // Get the jobHistory
            var response = await _client.GetAsync($"/api/job-histories/{_jobHistory.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_jobHistory.Id);
            json.SelectTokens("$.startDate").Should().Contain(DefaultStartDate);
            json.SelectTokens("$.endDate").Should().Contain(DefaultEndDate);
            json.SelectTokens("$.language").Should().Contain(DefaultLanguage.ToString());
        }

        [Fact]
        public async Task GetNonExistingJobHistory()
        {
            var maxValue = 9999999L;
            var response = await _client.GetAsync("/api/job-histories/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateJobHistory()
        {
            // Initialize the database
            await _jobHistoryRepository.CreateOrUpdateAsync(_jobHistory);
            await _jobHistoryRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _jobHistoryRepository.CountAsync();

            // Update the jobHistory
            var updatedJobHistory = await _jobHistoryRepository.QueryHelper().GetOneAsync(it => it.Id == _jobHistory.Id);
            // Disconnect from session so that the updates on updatedJobHistory are not directly saved in db
            //TODO detach
            updatedJobHistory.StartDate = UpdatedStartDate;
            updatedJobHistory.EndDate = UpdatedEndDate;
            updatedJobHistory.Language = UpdatedLanguage;

            JobHistoryDto updatedJobHistoryDto = _mapper.Map<JobHistoryDto>(updatedJobHistory);
            var response = await _client.PutAsync($"/api/job-histories/{_jobHistory.Id}", TestUtil.ToJsonContent(updatedJobHistoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the JobHistory in the database
            var jobHistoryList = await _jobHistoryRepository.GetAllAsync();
            jobHistoryList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testJobHistory = jobHistoryList.Last();
            testJobHistory.StartDate.Should().BeCloseTo(UpdatedStartDate, 1.Milliseconds());
            testJobHistory.EndDate.Should().BeCloseTo(UpdatedEndDate, 1.Milliseconds());
            testJobHistory.Language.Should().Be(UpdatedLanguage);
        }

        [Fact]
        public async Task UpdateNonExistingJobHistory()
        {
            var databaseSizeBeforeUpdate = await _jobHistoryRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            JobHistoryDto _jobHistoryDto = _mapper.Map<JobHistoryDto>(_jobHistory);
            var response = await _client.PutAsync("/api/job-histories/1", TestUtil.ToJsonContent(_jobHistoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the JobHistory in the database
            var jobHistoryList = await _jobHistoryRepository.GetAllAsync();
            jobHistoryList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteJobHistory()
        {
            // Initialize the database
            await _jobHistoryRepository.CreateOrUpdateAsync(_jobHistory);
            await _jobHistoryRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _jobHistoryRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/job-histories/{_jobHistory.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Validate the database is empty
            var jobHistoryList = await _jobHistoryRepository.GetAllAsync();
            jobHistoryList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(JobHistory));
            var jobHistory1 = new JobHistory
            {
                Id = 1L
            };
            var jobHistory2 = new JobHistory
            {
                Id = jobHistory1.Id
            };
            jobHistory1.Should().Be(jobHistory2);
            jobHistory2.Id = 2L;
            jobHistory1.Should().NotBe(jobHistory2);
            jobHistory1.Id = 0L;
            jobHistory1.Should().NotBe(jobHistory2);
        }
    }
}

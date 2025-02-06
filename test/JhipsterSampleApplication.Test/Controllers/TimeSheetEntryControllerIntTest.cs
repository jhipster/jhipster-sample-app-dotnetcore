
using AutoMapper;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using JhipsterSampleApplication.Infrastructure.Data;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using JhipsterSampleApplication.Dto;
using JhipsterSampleApplication.Configuration.AutoMapper;
using JhipsterSampleApplication.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace JhipsterSampleApplication.Test.Controllers
{
    public class TimeSheetEntriesControllerIntTest
    {
        public TimeSheetEntriesControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _timeSheetEntryRepository = _factory.GetRequiredService<ITimeSheetEntryRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultActivityName = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedActivityName = "546c776b3e23f5f2ebdd3b0a";

        private static readonly int DefaultStartTimeMilitary = 1;
        private static readonly int UpdatedStartTimeMilitary = 2;

        private static readonly int DefaultEndTimeMilitary = 1;
        private static readonly int UpdatedEndTimeMilitary = 2;

        private static readonly decimal DefaultTotalTime = 1M;
        private static readonly decimal UpdatedTotalTime = 2M;

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly ITimeSheetEntryRepository _timeSheetEntryRepository;

        private TimeSheetEntry _timeSheetEntry;

        private readonly IMapper _mapper;

        private TimeSheetEntry CreateEntity()
        {
            return new TimeSheetEntry
            {
                ActivityName = DefaultActivityName,
                StartTimeMilitary = DefaultStartTimeMilitary,
                EndTimeMilitary = DefaultEndTimeMilitary,
                TotalTime = DefaultTotalTime,
            };
        }

        private void InitTest()
        {
            _timeSheetEntry = CreateEntity();
        }

        [Fact]
        public async Task CreateTimeSheetEntry()
        {
            var databaseSizeBeforeCreate = await _timeSheetEntryRepository.CountAsync();

            // Create the TimeSheetEntry
            TimeSheetEntryDto _timeSheetEntryDto = _mapper.Map<TimeSheetEntryDto>(_timeSheetEntry);
            var response = await _client.PostAsync("/api/time-sheet-entries", TestUtil.ToJsonContent(_timeSheetEntryDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the TimeSheetEntry in the database
            var timeSheetEntryList = await _timeSheetEntryRepository.GetAllAsync();
            timeSheetEntryList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testTimeSheetEntry = timeSheetEntryList.Last();
            testTimeSheetEntry.ActivityName.Should().Be(DefaultActivityName);
            testTimeSheetEntry.StartTimeMilitary.Should().Be(DefaultStartTimeMilitary);
            testTimeSheetEntry.EndTimeMilitary.Should().Be(DefaultEndTimeMilitary);
            testTimeSheetEntry.TotalTime.Should().Be(DefaultTotalTime);
        }

        [Fact]
        public async Task CreateTimeSheetEntryWithExistingId()
        {
            var databaseSizeBeforeCreate = await _timeSheetEntryRepository.CountAsync();
            // Create the TimeSheetEntry with an existing ID
            _timeSheetEntry.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            TimeSheetEntryDto _timeSheetEntryDto = _mapper.Map<TimeSheetEntryDto>(_timeSheetEntry);
            var response = await _client.PostAsync("/api/time-sheet-entries", TestUtil.ToJsonContent(_timeSheetEntryDto));

            // Validate the TimeSheetEntry in the database
            var timeSheetEntryList = await _timeSheetEntryRepository.GetAllAsync();
            timeSheetEntryList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllTimeSheetEntries()
        {
            // Initialize the database
            await _timeSheetEntryRepository.CreateOrUpdateAsync(_timeSheetEntry);
            await _timeSheetEntryRepository.SaveChangesAsync();

            // Get all the timeSheetEntryList
            var response = await _client.GetAsync("/api/time-sheet-entries?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_timeSheetEntry.Id);
            json.SelectTokens("$.[*].activityName").Should().Contain(DefaultActivityName);
            json.SelectTokens("$.[*].startTimeMilitary").Should().Contain(DefaultStartTimeMilitary);
            json.SelectTokens("$.[*].endTimeMilitary").Should().Contain(DefaultEndTimeMilitary);
            json.SelectTokens("$.[*].totalTime").Should().Contain(DefaultTotalTime);
        }

        [Fact]
        public async Task GetTimeSheetEntry()
        {
            // Initialize the database
            await _timeSheetEntryRepository.CreateOrUpdateAsync(_timeSheetEntry);
            await _timeSheetEntryRepository.SaveChangesAsync();

            // Get the timeSheetEntry
            var response = await _client.GetAsync($"/api/time-sheet-entries/{_timeSheetEntry.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_timeSheetEntry.Id);
            json.SelectTokens("$.activityName").Should().Contain(DefaultActivityName);
            json.SelectTokens("$.startTimeMilitary").Should().Contain(DefaultStartTimeMilitary);
            json.SelectTokens("$.endTimeMilitary").Should().Contain(DefaultEndTimeMilitary);
            json.SelectTokens("$.totalTime").Should().Contain(DefaultTotalTime);
        }

        [Fact]
        public async Task GetNonExistingTimeSheetEntry()
        {
            var maxValue = 9999999L;
            var response = await _client.GetAsync("/api/time-sheet-entries/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateTimeSheetEntry()
        {
            // Initialize the database
            await _timeSheetEntryRepository.CreateOrUpdateAsync(_timeSheetEntry);
            await _timeSheetEntryRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _timeSheetEntryRepository.CountAsync();

            // Update the timeSheetEntry
            var updatedTimeSheetEntry = await _timeSheetEntryRepository.QueryHelper().GetOneAsync(it => it.Id == _timeSheetEntry.Id);
            // Disconnect from session so that the updates on updatedTimeSheetEntry are not directly saved in db
            //TODO detach
            updatedTimeSheetEntry.ActivityName = UpdatedActivityName;
            updatedTimeSheetEntry.StartTimeMilitary = UpdatedStartTimeMilitary;
            updatedTimeSheetEntry.EndTimeMilitary = UpdatedEndTimeMilitary;
            updatedTimeSheetEntry.TotalTime = UpdatedTotalTime;

            TimeSheetEntryDto updatedTimeSheetEntryDto = _mapper.Map<TimeSheetEntryDto>(updatedTimeSheetEntry);
            var response = await _client.PutAsync($"/api/time-sheet-entries/{_timeSheetEntry.Id}", TestUtil.ToJsonContent(updatedTimeSheetEntryDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the TimeSheetEntry in the database
            var timeSheetEntryList = await _timeSheetEntryRepository.GetAllAsync();
            timeSheetEntryList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testTimeSheetEntry = timeSheetEntryList.Last();
            testTimeSheetEntry.ActivityName.Should().Be(UpdatedActivityName);
            testTimeSheetEntry.StartTimeMilitary.Should().Be(UpdatedStartTimeMilitary);
            testTimeSheetEntry.EndTimeMilitary.Should().Be(UpdatedEndTimeMilitary);
            testTimeSheetEntry.TotalTime.Should().Be(UpdatedTotalTime);
        }

        [Fact]
        public async Task UpdateNonExistingTimeSheetEntry()
        {
            var databaseSizeBeforeUpdate = await _timeSheetEntryRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            TimeSheetEntryDto _timeSheetEntryDto = _mapper.Map<TimeSheetEntryDto>(_timeSheetEntry);
            var response = await _client.PutAsync("/api/time-sheet-entries/1", TestUtil.ToJsonContent(_timeSheetEntryDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the TimeSheetEntry in the database
            var timeSheetEntryList = await _timeSheetEntryRepository.GetAllAsync();
            timeSheetEntryList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteTimeSheetEntry()
        {
            // Initialize the database
            await _timeSheetEntryRepository.CreateOrUpdateAsync(_timeSheetEntry);
            await _timeSheetEntryRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _timeSheetEntryRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/time-sheet-entries/{_timeSheetEntry.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Validate the database is empty
            var timeSheetEntryList = await _timeSheetEntryRepository.GetAllAsync();
            timeSheetEntryList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(TimeSheetEntry));
            var timeSheetEntry1 = new TimeSheetEntry
            {
                Id = 1L
            };
            var timeSheetEntry2 = new TimeSheetEntry
            {
                Id = timeSheetEntry1.Id
            };
            timeSheetEntry1.Should().Be(timeSheetEntry2);
            timeSheetEntry2.Id = 2L;
            timeSheetEntry1.Should().NotBe(timeSheetEntry2);
            timeSheetEntry1.Id = 0L;
            timeSheetEntry1.Should().NotBe(timeSheetEntry2);
        }
    }
}

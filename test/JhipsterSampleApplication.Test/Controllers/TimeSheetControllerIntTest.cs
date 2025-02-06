
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
using JhipsterSampleApplication.Dto;
using JhipsterSampleApplication.Configuration.AutoMapper;
using JhipsterSampleApplication.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace JhipsterSampleApplication.Test.Controllers
{
    public class TimeSheetsControllerIntTest
    {
        public TimeSheetsControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _timeSheetRepository = _factory.GetRequiredService<ITimeSheetRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private static readonly DateTime DefaultTimeSheetDate = DateTime.UnixEpoch;
        private static readonly DateTime UpdatedTimeSheetDate = DateTime.UtcNow;

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly ITimeSheetRepository _timeSheetRepository;

        private TimeSheet _timeSheet;

        private readonly IMapper _mapper;

        private TimeSheet CreateEntity()
        {
            return new TimeSheet
            {
                TimeSheetDate = DefaultTimeSheetDate,
            };
        }

        private void InitTest()
        {
            _timeSheet = CreateEntity();
        }

        [Fact]
        public async Task CreateTimeSheet()
        {
            var databaseSizeBeforeCreate = await _timeSheetRepository.CountAsync();

            // Create the TimeSheet
            TimeSheetDto _timeSheetDto = _mapper.Map<TimeSheetDto>(_timeSheet);
            var response = await _client.PostAsync("/api/time-sheets", TestUtil.ToJsonContent(_timeSheetDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the TimeSheet in the database
            var timeSheetList = await _timeSheetRepository.GetAllAsync();
            timeSheetList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testTimeSheet = timeSheetList.Last();
            testTimeSheet.TimeSheetDate.Should().Be(DefaultTimeSheetDate);
        }

        [Fact]
        public async Task CreateTimeSheetWithExistingId()
        {
            var databaseSizeBeforeCreate = await _timeSheetRepository.CountAsync();
            // Create the TimeSheet with an existing ID
            _timeSheet.Id = Guid.NewGuid();

            // An entity with an existing ID cannot be created, so this API call must fail
            TimeSheetDto _timeSheetDto = _mapper.Map<TimeSheetDto>(_timeSheet);
            var response = await _client.PostAsync("/api/time-sheets", TestUtil.ToJsonContent(_timeSheetDto));

            // Validate the TimeSheet in the database
            var timeSheetList = await _timeSheetRepository.GetAllAsync();
            timeSheetList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllTimeSheets()
        {
            // Initialize the database
            await _timeSheetRepository.CreateOrUpdateAsync(_timeSheet);
            await _timeSheetRepository.SaveChangesAsync();

            // Get all the timeSheetList
            var response = await _client.GetAsync("/api/time-sheets?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_timeSheet.Id.ToString());
            json.SelectTokens("$.[*].timeSheetDate").Should().Contain(DefaultTimeSheetDate);
        }

        [Fact]
        public async Task GetTimeSheet()
        {
            // Initialize the database
            await _timeSheetRepository.CreateOrUpdateAsync(_timeSheet);
            await _timeSheetRepository.SaveChangesAsync();

            // Get the timeSheet
            var response = await _client.GetAsync($"/api/time-sheets/{_timeSheet.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_timeSheet.Id.ToString());
            json.SelectTokens("$.timeSheetDate").Should().Contain(DefaultTimeSheetDate);
        }

        [Fact]
        public async Task GetNonExistingTimeSheet()
        {
            var maxValue = Guid.NewGuid();
            var response = await _client.GetAsync("/api/time-sheets/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateTimeSheet()
        {
            // Initialize the database
            await _timeSheetRepository.CreateOrUpdateAsync(_timeSheet);
            await _timeSheetRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _timeSheetRepository.CountAsync();

            // Update the timeSheet
            var updatedTimeSheet = await _timeSheetRepository.QueryHelper().GetOneAsync(it => it.Id == _timeSheet.Id);
            // Disconnect from session so that the updates on updatedTimeSheet are not directly saved in db
            //TODO detach
            updatedTimeSheet.TimeSheetDate = UpdatedTimeSheetDate;

            TimeSheetDto updatedTimeSheetDto = _mapper.Map<TimeSheetDto>(updatedTimeSheet);
            var response = await _client.PutAsync($"/api/time-sheets/{_timeSheet.Id}", TestUtil.ToJsonContent(updatedTimeSheetDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the TimeSheet in the database
            var timeSheetList = await _timeSheetRepository.GetAllAsync();
            timeSheetList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testTimeSheet = timeSheetList.Last();
            testTimeSheet.TimeSheetDate.Should().BeCloseTo(UpdatedTimeSheetDate, 2.Seconds());
        }

        [Fact]
        public async Task UpdateNonExistingTimeSheet()
        {
            var databaseSizeBeforeUpdate = await _timeSheetRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            TimeSheetDto _timeSheetDto = _mapper.Map<TimeSheetDto>(_timeSheet);
            var response = await _client.PutAsync("/api/time-sheets/1", TestUtil.ToJsonContent(_timeSheetDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the TimeSheet in the database
            var timeSheetList = await _timeSheetRepository.GetAllAsync();
            timeSheetList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteTimeSheet()
        {
            // Initialize the database
            await _timeSheetRepository.CreateOrUpdateAsync(_timeSheet);
            await _timeSheetRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _timeSheetRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/time-sheets/{_timeSheet.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Validate the database is empty
            var timeSheetList = await _timeSheetRepository.GetAllAsync();
            timeSheetList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(TimeSheet));
            var timeSheet1 = new TimeSheet
            {
                Id = Guid.NewGuid()
            };
            var timeSheet2 = new TimeSheet
            {
                Id = timeSheet1.Id
            };
            timeSheet1.Should().Be(timeSheet2);
            timeSheet2.Id = Guid.NewGuid();
            timeSheet1.Should().NotBe(timeSheet2);
            timeSheet1.Id = null;
            timeSheet1.Should().NotBe(timeSheet2);
        }
    }
}

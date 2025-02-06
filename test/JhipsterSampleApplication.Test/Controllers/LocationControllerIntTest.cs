
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
    public class LocationsControllerIntTest
    {
        public LocationsControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _locationRepository = _factory.GetRequiredService<ILocationRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultStreetAddress = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedStreetAddress = "546c776b3e23f5f2ebdd3b0a";

        private const string DefaultPostalCode = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedPostalCode = "546c776b3e23f5f2ebdd3b0a";

        private const string DefaultCity = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedCity = "546c776b3e23f5f2ebdd3b0a";

        private const string DefaultStateProvince = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedStateProvince = "546c776b3e23f5f2ebdd3b0a";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly ILocationRepository _locationRepository;

        private Location _location;

        private readonly IMapper _mapper;

        private Location CreateEntity()
        {
            return new Location
            {
                StreetAddress = DefaultStreetAddress,
                PostalCode = DefaultPostalCode,
                City = DefaultCity,
                StateProvince = DefaultStateProvince,
            };
        }

        private void InitTest()
        {
            _location = CreateEntity();
        }

        [Fact]
        public async Task CreateLocation()
        {
            var databaseSizeBeforeCreate = await _locationRepository.CountAsync();

            // Create the Location
            LocationDto _locationDto = _mapper.Map<LocationDto>(_location);
            var response = await _client.PostAsync("/api/locations", TestUtil.ToJsonContent(_locationDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Location in the database
            var locationList = await _locationRepository.GetAllAsync();
            locationList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testLocation = locationList.Last();
            testLocation.StreetAddress.Should().Be(DefaultStreetAddress);
            testLocation.PostalCode.Should().Be(DefaultPostalCode);
            testLocation.City.Should().Be(DefaultCity);
            testLocation.StateProvince.Should().Be(DefaultStateProvince);
        }

        [Fact]
        public async Task CreateLocationWithExistingId()
        {
            var databaseSizeBeforeCreate = await _locationRepository.CountAsync();
            // Create the Location with an existing ID
            _location.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            LocationDto _locationDto = _mapper.Map<LocationDto>(_location);
            var response = await _client.PostAsync("/api/locations", TestUtil.ToJsonContent(_locationDto));

            // Validate the Location in the database
            var locationList = await _locationRepository.GetAllAsync();
            locationList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllLocations()
        {
            // Initialize the database
            await _locationRepository.CreateOrUpdateAsync(_location);
            await _locationRepository.SaveChangesAsync();

            // Get all the locationList
            var response = await _client.GetAsync("/api/locations?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_location.Id);
            json.SelectTokens("$.[*].streetAddress").Should().Contain(DefaultStreetAddress);
            json.SelectTokens("$.[*].postalCode").Should().Contain(DefaultPostalCode);
            json.SelectTokens("$.[*].city").Should().Contain(DefaultCity);
            json.SelectTokens("$.[*].stateProvince").Should().Contain(DefaultStateProvince);
        }

        [Fact]
        public async Task GetLocation()
        {
            // Initialize the database
            await _locationRepository.CreateOrUpdateAsync(_location);
            await _locationRepository.SaveChangesAsync();

            // Get the location
            var response = await _client.GetAsync($"/api/locations/{_location.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_location.Id);
            json.SelectTokens("$.streetAddress").Should().Contain(DefaultStreetAddress);
            json.SelectTokens("$.postalCode").Should().Contain(DefaultPostalCode);
            json.SelectTokens("$.city").Should().Contain(DefaultCity);
            json.SelectTokens("$.stateProvince").Should().Contain(DefaultStateProvince);
        }

        [Fact]
        public async Task GetNonExistingLocation()
        {
            var maxValue = 9999999L;
            var response = await _client.GetAsync("/api/locations/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateLocation()
        {
            // Initialize the database
            await _locationRepository.CreateOrUpdateAsync(_location);
            await _locationRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _locationRepository.CountAsync();

            // Update the location
            var updatedLocation = await _locationRepository.QueryHelper().GetOneAsync(it => it.Id == _location.Id);
            // Disconnect from session so that the updates on updatedLocation are not directly saved in db
            //TODO detach
            updatedLocation.StreetAddress = UpdatedStreetAddress;
            updatedLocation.PostalCode = UpdatedPostalCode;
            updatedLocation.City = UpdatedCity;
            updatedLocation.StateProvince = UpdatedStateProvince;

            LocationDto updatedLocationDto = _mapper.Map<LocationDto>(updatedLocation);
            var response = await _client.PutAsync($"/api/locations/{_location.Id}", TestUtil.ToJsonContent(updatedLocationDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Location in the database
            var locationList = await _locationRepository.GetAllAsync();
            locationList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testLocation = locationList.Last();
            testLocation.StreetAddress.Should().Be(UpdatedStreetAddress);
            testLocation.PostalCode.Should().Be(UpdatedPostalCode);
            testLocation.City.Should().Be(UpdatedCity);
            testLocation.StateProvince.Should().Be(UpdatedStateProvince);
        }

        [Fact]
        public async Task UpdateNonExistingLocation()
        {
            var databaseSizeBeforeUpdate = await _locationRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            LocationDto _locationDto = _mapper.Map<LocationDto>(_location);
            var response = await _client.PutAsync("/api/locations/1", TestUtil.ToJsonContent(_locationDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Location in the database
            var locationList = await _locationRepository.GetAllAsync();
            locationList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteLocation()
        {
            // Initialize the database
            await _locationRepository.CreateOrUpdateAsync(_location);
            await _locationRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _locationRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/locations/{_location.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Validate the database is empty
            var locationList = await _locationRepository.GetAllAsync();
            locationList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Location));
            var location1 = new Location
            {
                Id = 1L
            };
            var location2 = new Location
            {
                Id = location1.Id
            };
            location1.Should().Be(location2);
            location2.Id = 2L;
            location1.Should().NotBe(location2);
            location1.Id = 0L;
            location1.Should().NotBe(location2);
        }
    }
}

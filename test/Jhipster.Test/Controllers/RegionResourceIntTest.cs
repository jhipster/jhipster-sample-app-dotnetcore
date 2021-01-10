
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
    public class RegionResourceIntTest
    {
        public RegionResourceIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _regionRepository = _factory.GetRequiredService<IRegionRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });

            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultRegionName = "AAAAAAAAAA";
        private const string UpdatedRegionName = "BBBBBBBBBB";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IRegionRepository _regionRepository;

        private Region _region;

        private readonly IMapper _mapper;

        private Region CreateEntity()
        {
            return new Region
            {
                RegionName = DefaultRegionName
            };
        }

        private void InitTest()
        {
            _region = CreateEntity();
        }

        [Fact]
        public async Task CreateRegion()
        {
            var databaseSizeBeforeCreate = await _regionRepository.CountAsync();

            // Create the Region
            RegionDto _regionDto = _mapper.Map<RegionDto>(_region);
            var response = await _client.PostAsync("/api/regions", TestUtil.ToJsonContent(_regionDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Region in the database
            var regionList = await _regionRepository.GetAllAsync();
            regionList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testRegion = regionList.Last();
            testRegion.RegionName.Should().Be(DefaultRegionName);
        }

        [Fact]
        public async Task CreateRegionWithExistingId()
        {
            var databaseSizeBeforeCreate = await _regionRepository.CountAsync();
            databaseSizeBeforeCreate.Should().Be(0);
            // Create the Region with an existing ID
            _region.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            RegionDto _regionDto = _mapper.Map<RegionDto>(_region);
            var response = await _client.PostAsync("/api/regions", TestUtil.ToJsonContent(_regionDto));

            // Validate the Region in the database
            var regionList = await _regionRepository.GetAllAsync();
            regionList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllRegions()
        {
            // Initialize the database
            await _regionRepository.CreateOrUpdateAsync(_region);
            await _regionRepository.SaveChangesAsync();

            // Get all the regionList
            var response = await _client.GetAsync("/api/regions?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_region.Id);
            json.SelectTokens("$.[*].regionName").Should().Contain(DefaultRegionName);
        }

        [Fact]
        public async Task GetRegion()
        {
            // Initialize the database
            await _regionRepository.CreateOrUpdateAsync(_region);
            await _regionRepository.SaveChangesAsync();

            // Get the region
            var response = await _client.GetAsync($"/api/regions/{_region.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_region.Id);
            json.SelectTokens("$.regionName").Should().Contain(DefaultRegionName);
        }

        [Fact]
        public async Task GetNonExistingRegion()
        {
            var response = await _client.GetAsync("/api/regions/" + long.MaxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateRegion()
        {
            // Initialize the database
            await _regionRepository.CreateOrUpdateAsync(_region);
            await _regionRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _regionRepository.CountAsync();

            // Update the region
            var updatedRegion = await _regionRepository.QueryHelper().GetOneAsync(it => it.Id == _region.Id);
            // Disconnect from session so that the updates on updatedRegion are not directly saved in db
            //TODO detach
            updatedRegion.RegionName = UpdatedRegionName;

            RegionDto updatedRegionDto = _mapper.Map<RegionDto>(_region);
            var response = await _client.PutAsync("/api/regions", TestUtil.ToJsonContent(updatedRegionDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Region in the database
            var regionList = await _regionRepository.GetAllAsync();
            regionList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testRegion = regionList.Last();
            testRegion.RegionName.Should().Be(UpdatedRegionName);
        }

        [Fact]
        public async Task UpdateNonExistingRegion()
        {
            var databaseSizeBeforeUpdate = await _regionRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            RegionDto _regionDto = _mapper.Map<RegionDto>(_region);
            var response = await _client.PutAsync("/api/regions", TestUtil.ToJsonContent(_regionDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Region in the database
            var regionList = await _regionRepository.GetAllAsync();
            regionList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteRegion()
        {
            // Initialize the database
            await _regionRepository.CreateOrUpdateAsync(_region);
            await _regionRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _regionRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/regions/{_region.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the database is empty
            var regionList = await _regionRepository.GetAllAsync();
            regionList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Region));
            var region1 = new Region
            {
                Id = 1L
            };
            var region2 = new Region
            {
                Id = region1.Id
            };
            region1.Should().Be(region2);
            region2.Id = 2L;
            region1.Should().NotBe(region2);
            region1.Id = 0;
            region1.Should().NotBe(region2);
        }
    }
}

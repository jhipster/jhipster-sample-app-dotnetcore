
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
    public class PieceOfWorksControllerIntTest
    {
        public PieceOfWorksControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _pieceOfWorkRepository = _factory.GetRequiredService<IPieceOfWorkRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultTitle = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedTitle = "546c776b3e23f5f2ebdd3b0a";

        private const string DefaultDescription = "546c776b3e23f5f2ebdd3b03";
        private const string UpdatedDescription = "546c776b3e23f5f2ebdd3b0a";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IPieceOfWorkRepository _pieceOfWorkRepository;

        private PieceOfWork _pieceOfWork;

        private readonly IMapper _mapper;

        private PieceOfWork CreateEntity()
        {
            return new PieceOfWork
            {
                Title = DefaultTitle,
                Description = DefaultDescription,
            };
        }

        private void InitTest()
        {
            _pieceOfWork = CreateEntity();
        }

        [Fact]
        public async Task CreatePieceOfWork()
        {
            var databaseSizeBeforeCreate = await _pieceOfWorkRepository.CountAsync();

            // Create the PieceOfWork
            PieceOfWorkDto _pieceOfWorkDto = _mapper.Map<PieceOfWorkDto>(_pieceOfWork);
            var response = await _client.PostAsync("/api/piece-of-works", TestUtil.ToJsonContent(_pieceOfWorkDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the PieceOfWork in the database
            var pieceOfWorkList = await _pieceOfWorkRepository.GetAllAsync();
            pieceOfWorkList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testPieceOfWork = pieceOfWorkList.Last();
            testPieceOfWork.Title.Should().Be(DefaultTitle);
            testPieceOfWork.Description.Should().Be(DefaultDescription);
        }

        [Fact]
        public async Task CreatePieceOfWorkWithExistingId()
        {
            var databaseSizeBeforeCreate = await _pieceOfWorkRepository.CountAsync();
            // Create the PieceOfWork with an existing ID
            _pieceOfWork.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            PieceOfWorkDto _pieceOfWorkDto = _mapper.Map<PieceOfWorkDto>(_pieceOfWork);
            var response = await _client.PostAsync("/api/piece-of-works", TestUtil.ToJsonContent(_pieceOfWorkDto));

            // Validate the PieceOfWork in the database
            var pieceOfWorkList = await _pieceOfWorkRepository.GetAllAsync();
            pieceOfWorkList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllPieceOfWorks()
        {
            // Initialize the database
            await _pieceOfWorkRepository.CreateOrUpdateAsync(_pieceOfWork);
            await _pieceOfWorkRepository.SaveChangesAsync();

            // Get all the pieceOfWorkList
            var response = await _client.GetAsync("/api/piece-of-works?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_pieceOfWork.Id);
            json.SelectTokens("$.[*].title").Should().Contain(DefaultTitle);
            json.SelectTokens("$.[*].description").Should().Contain(DefaultDescription);
        }

        [Fact]
        public async Task GetPieceOfWork()
        {
            // Initialize the database
            await _pieceOfWorkRepository.CreateOrUpdateAsync(_pieceOfWork);
            await _pieceOfWorkRepository.SaveChangesAsync();

            // Get the pieceOfWork
            var response = await _client.GetAsync($"/api/piece-of-works/{_pieceOfWork.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_pieceOfWork.Id);
            json.SelectTokens("$.title").Should().Contain(DefaultTitle);
            json.SelectTokens("$.description").Should().Contain(DefaultDescription);
        }

        [Fact]
        public async Task GetNonExistingPieceOfWork()
        {
            var maxValue = 9999999L;
            var response = await _client.GetAsync("/api/piece-of-works/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdatePieceOfWork()
        {
            // Initialize the database
            await _pieceOfWorkRepository.CreateOrUpdateAsync(_pieceOfWork);
            await _pieceOfWorkRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _pieceOfWorkRepository.CountAsync();

            // Update the pieceOfWork
            var updatedPieceOfWork = await _pieceOfWorkRepository.QueryHelper().GetOneAsync(it => it.Id == _pieceOfWork.Id);
            // Disconnect from session so that the updates on updatedPieceOfWork are not directly saved in db
            //TODO detach
            updatedPieceOfWork.Title = UpdatedTitle;
            updatedPieceOfWork.Description = UpdatedDescription;

            PieceOfWorkDto updatedPieceOfWorkDto = _mapper.Map<PieceOfWorkDto>(updatedPieceOfWork);
            var response = await _client.PutAsync($"/api/piece-of-works/{_pieceOfWork.Id}", TestUtil.ToJsonContent(updatedPieceOfWorkDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the PieceOfWork in the database
            var pieceOfWorkList = await _pieceOfWorkRepository.GetAllAsync();
            pieceOfWorkList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testPieceOfWork = pieceOfWorkList.Last();
            testPieceOfWork.Title.Should().Be(UpdatedTitle);
            testPieceOfWork.Description.Should().Be(UpdatedDescription);
        }

        [Fact]
        public async Task UpdateNonExistingPieceOfWork()
        {
            var databaseSizeBeforeUpdate = await _pieceOfWorkRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            PieceOfWorkDto _pieceOfWorkDto = _mapper.Map<PieceOfWorkDto>(_pieceOfWork);
            var response = await _client.PutAsync("/api/piece-of-works/1", TestUtil.ToJsonContent(_pieceOfWorkDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the PieceOfWork in the database
            var pieceOfWorkList = await _pieceOfWorkRepository.GetAllAsync();
            pieceOfWorkList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeletePieceOfWork()
        {
            // Initialize the database
            await _pieceOfWorkRepository.CreateOrUpdateAsync(_pieceOfWork);
            await _pieceOfWorkRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _pieceOfWorkRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/piece-of-works/{_pieceOfWork.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Validate the database is empty
            var pieceOfWorkList = await _pieceOfWorkRepository.GetAllAsync();
            pieceOfWorkList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(PieceOfWork));
            var pieceOfWork1 = new PieceOfWork
            {
                Id = 1L
            };
            var pieceOfWork2 = new PieceOfWork
            {
                Id = pieceOfWork1.Id
            };
            pieceOfWork1.Should().Be(pieceOfWork2);
            pieceOfWork2.Id = 2L;
            pieceOfWork1.Should().NotBe(pieceOfWork2);
            pieceOfWork1.Id = 0L;
            pieceOfWork1.Should().NotBe(pieceOfWork2);
        }
    }
}

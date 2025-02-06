
using System;
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Crosscutting.Exceptions;
using JhipsterSampleApplication.Dto;
using JhipsterSampleApplication.Web.Extensions;
using JhipsterSampleApplication.Web.Rest.Utilities;
using AutoMapper;
using System.Linq;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using JhipsterSampleApplication.Domain.Services.Interfaces;
using JhipsterSampleApplication.Infrastructure.Web.Rest.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace JhipsterSampleApplication.Controllers
{
    [Authorize]
    [Route("api/countries")]
    [ApiController]
    public class CountriesController : ControllerBase
    {
        private const string EntityName = "country";
        private readonly ILogger<CountriesController> _log;
        private readonly IMapper _mapper;
        private readonly ICountryService _countryService;

        public CountriesController(ILogger<CountriesController> log,
        IMapper mapper,
        ICountryService countryService)
        {
            _log = log;
            _mapper = mapper;
            _countryService = countryService;
        }

        [HttpPost]
        public async Task<ActionResult<CountryDto>> CreateCountry([FromBody] CountryDto countryDto)
        {
            _log.LogDebug($"REST request to save Country : {countryDto}");
            if (countryDto.Id != 0 && countryDto.Id != null)
                throw new BadRequestAlertException("A new country cannot already have an ID", EntityName, "idexists");

            Country country = _mapper.Map<Country>(countryDto);
            await _countryService.Save(country);
            return CreatedAtAction(nameof(GetCountry), new { id = country.Id }, country)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, country.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCountry(long? id, [FromBody] CountryDto countryDto)
        {
            _log.LogDebug($"REST request to update Country : {countryDto}");
            if (countryDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != countryDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Country country = _mapper.Map<Country>(countryDto);
            await _countryService.Save(country);
            return Ok(country)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, country.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CountryDto>>> GetAllCountries(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Countries");
            var result = await _countryService.FindAll(pageable);
            var page = new Page<CountryDto>(result.Content.Select(entity => _mapper.Map<CountryDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<CountryDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCountry([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get Country : {id}");
            var result = await _countryService.FindOne(id);
            CountryDto countryDto = _mapper.Map<CountryDto>(result);
            return ActionResultUtil.WrapOrNotFound(countryDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCountry([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete Country : {id}");
            await _countryService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

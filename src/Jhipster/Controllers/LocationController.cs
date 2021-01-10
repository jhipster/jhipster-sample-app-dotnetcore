
using AutoMapper;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;
using Jhipster.Crosscutting.Exceptions;
using Jhipster.Dto;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Web.Extensions;
using Jhipster.Web.Filters;
using Jhipster.Web.Rest.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Controllers
{
    [Authorize]
    [Route("api")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private const string EntityName = "location";
        private readonly IMapper _mapper;
        private readonly ILocationService _locationService;
        private readonly ILogger<LocationController> _log;

        public LocationController(ILogger<LocationController> log,
            IMapper mapper,
            ILocationService locationService)
        {
            _log = log;
            _mapper = mapper;
            _locationService = locationService;
        }

        [HttpPost("locations")]
        [ValidateModel]
        public async Task<ActionResult<LocationDto>> CreateLocation([FromBody] LocationDto locationDto)
        {
            _log.LogDebug($"REST request to save Location : {locationDto}");
            if (locationDto.Id != 0)
                throw new BadRequestAlertException("A new location cannot already have an ID", EntityName, "idexists");

            Location location = _mapper.Map<Location>(locationDto);
            await _locationService.Save(location);
            return CreatedAtAction(nameof(GetLocation), new { id = location.Id }, location)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, location.Id.ToString()));
        }

        [HttpPut("locations")]
        [ValidateModel]
        public async Task<IActionResult> UpdateLocation([FromBody] LocationDto locationDto)
        {
            _log.LogDebug($"REST request to update Location : {locationDto}");
            if (locationDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Location location = _mapper.Map<Location>(locationDto);
            await _locationService.Save(location);
            return Ok(location)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, location.Id.ToString()));
        }

        [HttpGet("locations")]
        public async Task<ActionResult<IEnumerable<LocationDto>>> GetAllLocations(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Locations");
            var result = await _locationService.FindAll(pageable);
            var page = new Page<LocationDto>(result.Content.Select(entity => _mapper.Map<LocationDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<LocationDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("locations/{id}")]
        public async Task<IActionResult> GetLocation([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Location : {id}");
            var result = await _locationService.FindOne(id);
            LocationDto locationDto = _mapper.Map<LocationDto>(result);
            return ActionResultUtil.WrapOrNotFound(locationDto);
        }

        [HttpDelete("locations/{id}")]
        public async Task<IActionResult> DeleteLocation([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Location : {id}");
            await _locationService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

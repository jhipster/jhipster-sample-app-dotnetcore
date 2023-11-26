
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Entities;
using Jhipster.Crosscutting.Exceptions;
using Jhipster.Dto;
using Jhipster.Web.Extensions;
using Jhipster.Web.Filters;
using Jhipster.Web.Rest.Utilities;
using AutoMapper;
using System.Linq;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Infrastructure.Web.Rest.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Controllers
{
    [Authorize]
    [Route("api/locations")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private const string EntityName = "location";
        private readonly ILogger<LocationsController> _log;
        private readonly IMapper _mapper;
        private readonly ILocationService _locationService;

        public LocationsController(ILogger<LocationsController> log,
        IMapper mapper,
        ILocationService locationService)
        {
            _log = log;
            _mapper = mapper;
            _locationService = locationService;
        }

        [HttpPost]
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

        [HttpPut("{id}")]
        [ValidateModel]
        public async Task<IActionResult> UpdateLocation(long id, [FromBody] LocationDto locationDto)
        {
            _log.LogDebug($"REST request to update Location : {locationDto}");
            if (locationDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != locationDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Location location = _mapper.Map<Location>(locationDto);
            await _locationService.Save(location);
            return Ok(location)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, location.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationDto>>> GetAllLocations(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Locations");
            var result = await _locationService.FindAll(pageable);
            var page = new Page<LocationDto>(result.Content.Select(entity => _mapper.Map<LocationDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<LocationDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLocation([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Location : {id}");
            var result = await _locationService.FindOne(id);
            LocationDto locationDto = _mapper.Map<LocationDto>(result);
            return ActionResultUtil.WrapOrNotFound(locationDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Location : {id}");
            await _locationService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

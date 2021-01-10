
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
    public class RegionController : ControllerBase
    {
        private const string EntityName = "region";
        private readonly IMapper _mapper;
        private readonly IRegionService _regionService;
        private readonly ILogger<RegionController> _log;

        public RegionController(ILogger<RegionController> log,
            IMapper mapper,
            IRegionService regionService)
        {
            _log = log;
            _mapper = mapper;
            _regionService = regionService;
        }

        [HttpPost("regions")]
        [ValidateModel]
        public async Task<ActionResult<RegionDto>> CreateRegion([FromBody] RegionDto regionDto)
        {
            _log.LogDebug($"REST request to save Region : {regionDto}");
            if (regionDto.Id != 0)
                throw new BadRequestAlertException("A new region cannot already have an ID", EntityName, "idexists");

            Region region = _mapper.Map<Region>(regionDto);
            await _regionService.Save(region);
            return CreatedAtAction(nameof(GetRegion), new { id = region.Id }, region)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, region.Id.ToString()));
        }

        [HttpPut("regions")]
        [ValidateModel]
        public async Task<IActionResult> UpdateRegion([FromBody] RegionDto regionDto)
        {
            _log.LogDebug($"REST request to update Region : {regionDto}");
            if (regionDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Region region = _mapper.Map<Region>(regionDto);
            await _regionService.Save(region);
            return Ok(region)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, region.Id.ToString()));
        }

        [HttpGet("regions")]
        public async Task<ActionResult<IEnumerable<RegionDto>>> GetAllRegions(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Regions");
            var result = await _regionService.FindAll(pageable);
            var page = new Page<RegionDto>(result.Content.Select(entity => _mapper.Map<RegionDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<RegionDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("regions/{id}")]
        public async Task<IActionResult> GetRegion([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Region : {id}");
            var result = await _regionService.FindOne(id);
            RegionDto regionDto = _mapper.Map<RegionDto>(result);
            return ActionResultUtil.WrapOrNotFound(regionDto);
        }

        [HttpDelete("regions/{id}")]
        public async Task<IActionResult> DeleteRegion([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Region : {id}");
            await _regionService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

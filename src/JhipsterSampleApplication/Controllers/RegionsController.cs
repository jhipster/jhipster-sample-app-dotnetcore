
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
    [Route("api/regions")]
    [ApiController]
    public class RegionsController : ControllerBase
    {
        private const string EntityName = "region";
        private readonly ILogger<RegionsController> _log;
        private readonly IMapper _mapper;
        private readonly IRegionService _regionService;

        public RegionsController(ILogger<RegionsController> log,
        IMapper mapper,
        IRegionService regionService)
        {
            _log = log;
            _mapper = mapper;
            _regionService = regionService;
        }

        [HttpPost]
        public async Task<ActionResult<RegionDto>> CreateRegion([FromBody] RegionDto regionDto)
        {
            _log.LogDebug($"REST request to save Region : {regionDto}");
            if (regionDto.Id != 0 && regionDto.Id != null)
                throw new BadRequestAlertException("A new region cannot already have an ID", EntityName, "idexists");

            Region region = _mapper.Map<Region>(regionDto);
            await _regionService.Save(region);
            return CreatedAtAction(nameof(GetRegion), new { id = region.Id }, region)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, region.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRegion(long? id, [FromBody] RegionDto regionDto)
        {
            _log.LogDebug($"REST request to update Region : {regionDto}");
            if (regionDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != regionDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Region region = _mapper.Map<Region>(regionDto);
            await _regionService.Save(region);
            return Ok(region)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, region.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RegionDto>>> GetAllRegions(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Regions");
            var result = await _regionService.FindAll(pageable);
            var page = new Page<RegionDto>(result.Content.Select(entity => _mapper.Map<RegionDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<RegionDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRegion([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get Region : {id}");
            var result = await _regionService.FindOne(id);
            RegionDto regionDto = _mapper.Map<RegionDto>(result);
            return ActionResultUtil.WrapOrNotFound(regionDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegion([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete Region : {id}");
            await _regionService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}


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
    [Route("api/time-sheet-entries")]
    [ApiController]
    public class TimeSheetEntriesController : ControllerBase
    {
        private const string EntityName = "timeSheetEntry";
        private readonly ILogger<TimeSheetEntriesController> _log;
        private readonly IMapper _mapper;
        private readonly ITimeSheetEntryService _timeSheetEntryService;

        public TimeSheetEntriesController(ILogger<TimeSheetEntriesController> log,
        IMapper mapper,
        ITimeSheetEntryService timeSheetEntryService)
        {
            _log = log;
            _mapper = mapper;
            _timeSheetEntryService = timeSheetEntryService;
        }

        [HttpPost]
        public async Task<ActionResult<TimeSheetEntryDto>> CreateTimeSheetEntry([FromBody] TimeSheetEntryDto timeSheetEntryDto)
        {
            _log.LogDebug($"REST request to save TimeSheetEntry : {timeSheetEntryDto}");
            if (timeSheetEntryDto.Id != 0 && timeSheetEntryDto.Id != null)
                throw new BadRequestAlertException("A new timeSheetEntry cannot already have an ID", EntityName, "idexists");

            TimeSheetEntry timeSheetEntry = _mapper.Map<TimeSheetEntry>(timeSheetEntryDto);
            await _timeSheetEntryService.Save(timeSheetEntry);
            return CreatedAtAction(nameof(GetTimeSheetEntry), new { id = timeSheetEntry.Id }, timeSheetEntry)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, timeSheetEntry.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTimeSheetEntry(long? id, [FromBody] TimeSheetEntryDto timeSheetEntryDto)
        {
            _log.LogDebug($"REST request to update TimeSheetEntry : {timeSheetEntryDto}");
            if (timeSheetEntryDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != timeSheetEntryDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            TimeSheetEntry timeSheetEntry = _mapper.Map<TimeSheetEntry>(timeSheetEntryDto);
            await _timeSheetEntryService.Save(timeSheetEntry);
            return Ok(timeSheetEntry)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, timeSheetEntry.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimeSheetEntryDto>>> GetAllTimeSheetEntries(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of TimeSheetEntries");
            var result = await _timeSheetEntryService.FindAll(pageable);
            var page = new Page<TimeSheetEntryDto>(result.Content.Select(entity => _mapper.Map<TimeSheetEntryDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<TimeSheetEntryDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTimeSheetEntry([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get TimeSheetEntry : {id}");
            var result = await _timeSheetEntryService.FindOne(id);
            TimeSheetEntryDto timeSheetEntryDto = _mapper.Map<TimeSheetEntryDto>(result);
            return ActionResultUtil.WrapOrNotFound(timeSheetEntryDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimeSheetEntry([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete TimeSheetEntry : {id}");
            await _timeSheetEntryService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

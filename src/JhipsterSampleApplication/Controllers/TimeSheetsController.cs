
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
    [Route("api/time-sheets")]
    [ApiController]
    public class TimeSheetsController : ControllerBase
    {
        private const string EntityName = "timeSheet";
        private readonly ILogger<TimeSheetsController> _log;
        private readonly IMapper _mapper;
        private readonly ITimeSheetService _timeSheetService;

        public TimeSheetsController(ILogger<TimeSheetsController> log,
        IMapper mapper,
        ITimeSheetService timeSheetService)
        {
            _log = log;
            _mapper = mapper;
            _timeSheetService = timeSheetService;
        }

        [HttpPost]
        public async Task<ActionResult<TimeSheetDto>> CreateTimeSheet([FromBody] TimeSheetDto timeSheetDto)
        {
            _log.LogDebug($"REST request to save TimeSheet : {timeSheetDto}");
            if (timeSheetDto.Id != null)
                throw new BadRequestAlertException("A new timeSheet cannot already have an ID", EntityName, "idexists");

            TimeSheet timeSheet = _mapper.Map<TimeSheet>(timeSheetDto);
            await _timeSheetService.Save(timeSheet);
            return CreatedAtAction(nameof(GetTimeSheet), new { id = timeSheet.Id }, timeSheet)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, timeSheet.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTimeSheet(Guid? id, [FromBody] TimeSheetDto timeSheetDto)
        {
            _log.LogDebug($"REST request to update TimeSheet : {timeSheetDto}");
            if (timeSheetDto.Id == null) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != timeSheetDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            TimeSheet timeSheet = _mapper.Map<TimeSheet>(timeSheetDto);
            await _timeSheetService.Save(timeSheet);
            return Ok(timeSheet)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, timeSheet.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimeSheetDto>>> GetAllTimeSheets(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of TimeSheets");
            var result = await _timeSheetService.FindAll(pageable);
            var page = new Page<TimeSheetDto>(result.Content.Select(entity => _mapper.Map<TimeSheetDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<TimeSheetDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTimeSheet([FromRoute] Guid? id)
        {
            _log.LogDebug($"REST request to get TimeSheet : {id}");
            var result = await _timeSheetService.FindOne(id);
            TimeSheetDto timeSheetDto = _mapper.Map<TimeSheetDto>(result);
            return ActionResultUtil.WrapOrNotFound(timeSheetDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimeSheet([FromRoute] Guid? id)
        {
            _log.LogDebug($"REST request to delete TimeSheet : {id}");
            await _timeSheetService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

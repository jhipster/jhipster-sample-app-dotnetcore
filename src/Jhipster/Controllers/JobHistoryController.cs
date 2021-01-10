
using AutoMapper;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;
using Jhipster.Crosscutting.Enums;
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
    public class JobHistoryController : ControllerBase
    {
        private const string EntityName = "jobHistory";
        private readonly IMapper _mapper;
        private readonly IJobHistoryService _jobHistoryService;
        private readonly ILogger<JobHistoryController> _log;

        public JobHistoryController(ILogger<JobHistoryController> log,
            IMapper mapper,
            IJobHistoryService jobHistoryService)
        {
            _log = log;
            _mapper = mapper;
            _jobHistoryService = jobHistoryService;
        }

        [HttpPost("job-histories")]
        [ValidateModel]
        public async Task<ActionResult<JobHistoryDto>> CreateJobHistory([FromBody] JobHistoryDto jobHistoryDto)
        {
            _log.LogDebug($"REST request to save JobHistory : {jobHistoryDto}");
            if (jobHistoryDto.Id != 0)
                throw new BadRequestAlertException("A new jobHistory cannot already have an ID", EntityName, "idexists");

            JobHistory jobHistory = _mapper.Map<JobHistory>(jobHistoryDto);
            await _jobHistoryService.Save(jobHistory);
            return CreatedAtAction(nameof(GetJobHistory), new { id = jobHistory.Id }, jobHistory)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, jobHistory.Id.ToString()));
        }

        [HttpPut("job-histories")]
        [ValidateModel]
        public async Task<IActionResult> UpdateJobHistory([FromBody] JobHistoryDto jobHistoryDto)
        {
            _log.LogDebug($"REST request to update JobHistory : {jobHistoryDto}");
            if (jobHistoryDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            JobHistory jobHistory = _mapper.Map<JobHistory>(jobHistoryDto);
            await _jobHistoryService.Save(jobHistory);
            return Ok(jobHistory)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, jobHistory.Id.ToString()));
        }

        [HttpGet("job-histories")]
        public async Task<ActionResult<IEnumerable<JobHistoryDto>>> GetAllJobHistories(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of JobHistories");
            var result = await _jobHistoryService.FindAll(pageable);
            var page = new Page<JobHistoryDto>(result.Content.Select(entity => _mapper.Map<JobHistoryDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<JobHistoryDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("job-histories/{id}")]
        public async Task<IActionResult> GetJobHistory([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get JobHistory : {id}");
            var result = await _jobHistoryService.FindOne(id);
            JobHistoryDto jobHistoryDto = _mapper.Map<JobHistoryDto>(result);
            return ActionResultUtil.WrapOrNotFound(jobHistoryDto);
        }

        [HttpDelete("job-histories/{id}")]
        public async Task<IActionResult> DeleteJobHistory([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete JobHistory : {id}");
            await _jobHistoryService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

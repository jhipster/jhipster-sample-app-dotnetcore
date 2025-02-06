
using System;
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Crosscutting.Enums;
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
    [Route("api/job-histories")]
    [ApiController]
    public class JobHistoriesController : ControllerBase
    {
        private const string EntityName = "jobHistory";
        private readonly ILogger<JobHistoriesController> _log;
        private readonly IMapper _mapper;
        private readonly IJobHistoryService _jobHistoryService;

        public JobHistoriesController(ILogger<JobHistoriesController> log,
        IMapper mapper,
        IJobHistoryService jobHistoryService)
        {
            _log = log;
            _mapper = mapper;
            _jobHistoryService = jobHistoryService;
        }

        [HttpPost]
        public async Task<ActionResult<JobHistoryDto>> CreateJobHistory([FromBody] JobHistoryDto jobHistoryDto)
        {
            _log.LogDebug($"REST request to save JobHistory : {jobHistoryDto}");
            if (jobHistoryDto.Id != 0 && jobHistoryDto.Id != null)
                throw new BadRequestAlertException("A new jobHistory cannot already have an ID", EntityName, "idexists");

            JobHistory jobHistory = _mapper.Map<JobHistory>(jobHistoryDto);
            await _jobHistoryService.Save(jobHistory);
            return CreatedAtAction(nameof(GetJobHistory), new { id = jobHistory.Id }, jobHistory)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, jobHistory.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJobHistory(long? id, [FromBody] JobHistoryDto jobHistoryDto)
        {
            _log.LogDebug($"REST request to update JobHistory : {jobHistoryDto}");
            if (jobHistoryDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != jobHistoryDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            JobHistory jobHistory = _mapper.Map<JobHistory>(jobHistoryDto);
            await _jobHistoryService.Save(jobHistory);
            return Ok(jobHistory)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, jobHistory.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobHistoryDto>>> GetAllJobHistories(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of JobHistories");
            var result = await _jobHistoryService.FindAll(pageable);
            var page = new Page<JobHistoryDto>(result.Content.Select(entity => _mapper.Map<JobHistoryDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<JobHistoryDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobHistory([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get JobHistory : {id}");
            var result = await _jobHistoryService.FindOne(id);
            JobHistoryDto jobHistoryDto = _mapper.Map<JobHistoryDto>(result);
            return ActionResultUtil.WrapOrNotFound(jobHistoryDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobHistory([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete JobHistory : {id}");
            await _jobHistoryService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}


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
    [Route("api/jobs")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        private const string EntityName = "job";
        private readonly ILogger<JobsController> _log;
        private readonly IMapper _mapper;
        private readonly IJobRepository _jobRepository;

        public JobsController(ILogger<JobsController> log,
        IMapper mapper,
        IJobRepository jobRepository)
        {
            _log = log;
            _mapper = mapper;
            _jobRepository = jobRepository;
        }

        [HttpPost]
        public async Task<ActionResult<JobDto>> CreateJob([FromBody] JobDto jobDto)
        {
            _log.LogDebug($"REST request to save Job : {jobDto}");
            if (jobDto.Id != 0 && jobDto.Id != null)
                throw new BadRequestAlertException("A new job cannot already have an ID", EntityName, "idexists");

            Job job = _mapper.Map<Job>(jobDto);
            await _jobRepository.CreateOrUpdateAsync(job);
            await _jobRepository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, job.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJob(long? id, [FromBody] JobDto jobDto)
        {
            _log.LogDebug($"REST request to update Job : {jobDto}");
            if (jobDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != jobDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Job job = _mapper.Map<Job>(jobDto);
            await _jobRepository.CreateOrUpdateAsync(job);
            await _jobRepository.SaveChangesAsync();
            return Ok(job)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, job.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobDto>>> GetAllJobs(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Jobs");
            var result = await _jobRepository.QueryHelper()
                .Include(job => job.Chores)
                .Include(job => job.Employee)
                .GetPageAsync(pageable);
            var page = new Page<JobDto>(result.Content.Select(entity => _mapper.Map<JobDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<JobDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJob([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get Job : {id}");
            var result = await _jobRepository.QueryHelper()
                .Include(job => job.Chores)
                .Include(job => job.Employee)
                .GetOneAsync(job => job.Id == id);
            JobDto jobDto = _mapper.Map<JobDto>(result);
            return ActionResultUtil.WrapOrNotFound(jobDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete Job : {id}");
            await _jobRepository.DeleteByIdAsync(id);
            await _jobRepository.SaveChangesAsync();
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}


using AutoMapper;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;
using Jhipster.Crosscutting.Exceptions;
using Jhipster.Dto;
using Jhipster.Domain.Repositories.Interfaces;
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
    public class JobController : ControllerBase
    {
        private const string EntityName = "job";
        private readonly IMapper _mapper;
        private readonly IJobRepository _jobRepository;
        private readonly ILogger<JobController> _log;

        public JobController(ILogger<JobController> log,
            IMapper mapper,
            IJobRepository jobRepository)
        {
            _log = log;
            _mapper = mapper;
            _jobRepository = jobRepository;
        }

        [HttpPost("jobs")]
        [ValidateModel]
        public async Task<ActionResult<JobDto>> CreateJob([FromBody] JobDto jobDto)
        {
            _log.LogDebug($"REST request to save Job : {jobDto}");
            if (jobDto.Id != 0)
                throw new BadRequestAlertException("A new job cannot already have an ID", EntityName, "idexists");

            Job job = _mapper.Map<Job>(jobDto);
            await _jobRepository.CreateOrUpdateAsync(job);
            await _jobRepository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, job.Id.ToString()));
        }

        [HttpPut("jobs")]
        [ValidateModel]
        public async Task<IActionResult> UpdateJob([FromBody] JobDto jobDto)
        {
            _log.LogDebug($"REST request to update Job : {jobDto}");
            if (jobDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Job job = _mapper.Map<Job>(jobDto);
            await _jobRepository.CreateOrUpdateAsync(job);
            await _jobRepository.SaveChangesAsync();
            return Ok(job)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, job.Id.ToString()));
        }

        [HttpGet("jobs")]
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

        [HttpGet("jobs/{id}")]
        public async Task<IActionResult> GetJob([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Job : {id}");
            var result = await _jobRepository.QueryHelper()
                .Include(job => job.Chores)
                .Include(job => job.Employee)
                .GetOneAsync(job => job.Id == id);
            JobDto jobDto = _mapper.Map<JobDto>(result);
            return ActionResultUtil.WrapOrNotFound(jobDto);
        }

        [HttpDelete("jobs/{id}")]
        public async Task<IActionResult> DeleteJob([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Job : {id}");
            await _jobRepository.DeleteByIdAsync(id);
            await _jobRepository.SaveChangesAsync();
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

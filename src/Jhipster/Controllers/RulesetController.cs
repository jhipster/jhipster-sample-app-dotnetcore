
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
    public class RulesetController : ControllerBase
    {
        private const string EntityName = "ruleset";
        private readonly IMapper _mapper;
        private readonly IRulesetService _rulesetService;
        private readonly ILogger<RulesetController> _log;

        public RulesetController(ILogger<RulesetController> log,
            IMapper mapper,
            IRulesetService rulesetService)
        {
            _log = log;
            _mapper = mapper;
            _rulesetService = rulesetService;
        }

        [HttpPost("ruleset")]
        [ValidateModel]
        public async Task<ActionResult<RulesetDto>> CreateRuleset([FromBody] RulesetDto rulesetDto)
        {
            _log.LogDebug($"REST request to save Ruleset : {rulesetDto}");
            if (rulesetDto.Id != 0)
                throw new BadRequestAlertException("A new ruleset cannot already have an ID", EntityName, "idexists");

            Ruleset ruleset = _mapper.Map<Ruleset>(rulesetDto);
            await _rulesetService.Save(ruleset);
            return CreatedAtAction(nameof(GetRuleset), new { id = ruleset.Id }, ruleset)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, ruleset.Id.ToString()));
        }

        [HttpPut("ruleset")]
        [ValidateModel]
        public async Task<IActionResult> UpdateRuleset([FromBody] RulesetDto rulesetDto)
        {
            _log.LogDebug($"REST request to update Ruleset : {rulesetDto}");
            if (rulesetDto.Id == 0){
                var result = await _rulesetService.FindOneByName(rulesetDto.Name);
                rulesetDto.Id = result.Id;
            }
            if (rulesetDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Ruleset ruleset = _mapper.Map<Ruleset>(rulesetDto);
            await _rulesetService.Save(ruleset);
            return Ok(ruleset)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, ruleset.Id.ToString()));
        }

        [HttpGet("ruleset")]
        public async Task<ActionResult<IEnumerable<RulesetDto>>> GetAllRulesets(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Rulesets");
            var result = await _rulesetService.FindAll(pageable);
            var page = new Page<RulesetDto>(result.Content.Select(entity => _mapper.Map<RulesetDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<RulesetDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("ruleset/{id}")]
        public async Task<IActionResult> GetRuleset([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Ruleset : {id}");
            var result = await _rulesetService.FindOne(id);
            RulesetDto rulesetDto = _mapper.Map<RulesetDto>(result);
            return ActionResultUtil.WrapOrNotFound(rulesetDto);
        }

        [HttpDelete("ruleset/{id}")]
        public async Task<IActionResult> DeleteRuleset([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Ruleset : {id}");
            await _rulesetService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

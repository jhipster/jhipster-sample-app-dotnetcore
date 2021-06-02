
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
using System;
using Nest;

namespace Jhipster.Controllers
{
    [Authorize]
    [Route("api")]
    [ApiController]
    public class BirthdayController : ControllerBase
    {
        private const string EntityName = "birthday";
        private readonly IMapper _mapper;
        private readonly IBirthdayService _birthdayService;
        private readonly ILogger<BirthdayController> _log;

        private static Uri node = new Uri("https://texttemplate-testing-7087740692.us-east-1.bonsaisearch.net/");
        private static Nest.ConnectionSettings setting = new Nest.ConnectionSettings(node).BasicAuthentication("7303xa0iq9","4cdkz0o14").DefaultIndex("birthdays");
        private static ElasticClient elastic = new ElasticClient(setting);

        public BirthdayController(ILogger<BirthdayController> log,
            IMapper mapper,
            IBirthdayService birthdayService)
        {
            _log = log;
            _mapper = mapper;
            _birthdayService = birthdayService;
        }

        [HttpPost("birthdays")]
        [ValidateModel]
        public async Task<ActionResult<BirthdayDto>> CreateBirthday([FromBody] BirthdayDto birthdayDto)
        {
            _log.LogDebug($"REST request to save Birthday : {birthdayDto}");
            if (birthdayDto.Id != "")
                throw new BadRequestAlertException("A new birthday cannot already have an ID", EntityName, "idexists");

            Birthday birthday = _mapper.Map<Birthday>(birthdayDto);
            await _birthdayService.Save(birthday);
            return CreatedAtAction(nameof(GetBirthday), new { id = birthday.Id }, birthday)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, birthday.Id.ToString()));
        }

        [HttpPut("birthdays")]
        [ValidateModel]
        public async Task<IActionResult> UpdateBirthday([FromBody] BirthdayDto birthdayDto)
        {
            _log.LogDebug($"REST request to update Birthday : {birthdayDto}");
            if (birthdayDto.Id == "") throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Birthday birthday = _mapper.Map<Birthday>(birthdayDto);
            await _birthdayService.Save(birthday);
            return Ok(birthday)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, birthday.Id.ToString()));
        }

        [HttpGet("birthdays")]
        public async Task<ActionResult<IEnumerable<BirthdayDto>>> GetAllBirthdays(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Birthdays");
            var searchResponse = await elastic.SearchAsync<Birthday>(s => s
                .Size(10000)
                .Query(q => q
                    .MatchAll()
                    //.DateRange(r => r
                    //    .Field(f => f.dob)
                    //    .GreaterThanOrEquals(new DateTime(1940, 01, 01))
                    //    .LessThan(new DateTime(1941, 01, 01))
                    //)
                )
            );
            List<BirthdayDto> content = new List<BirthdayDto>();
            Console.WriteLine(searchResponse.Hits.Count + " hits");
            foreach (var hit in searchResponse.Hits)
            {
                content.Add(new BirthdayDto{
                    Id = hit.Id,
                    Lname = hit.Source.lname,
                    Fname = hit.Source.fname,
                    Dob = hit.Source.dob,
                    Sign = hit.Source.sign,
                    IsAlive = hit.Source.isAlive 
                });
            }
            Page<BirthdayDto> page = new Page<BirthdayDto>(content, pageable, content.Count);
            return Ok(((IPage<BirthdayDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("birthdays/{id}")]
        public async Task<IActionResult> GetBirthday([FromRoute] string id)
        {
            _log.LogDebug($"REST request to get Birthday : {id}");
            var hit = await elastic.GetAsync<Birthday>(id);
            BirthdayDto birthdayDto = new BirthdayDto{
                Id = hit.Id,
                Lname = hit.Source.lname,
                Fname = hit.Source.fname,
                Dob = hit.Source.dob,
                Sign = hit.Source.sign,
                IsAlive = hit.Source.isAlive 
            };
            return ActionResultUtil.WrapOrNotFound(birthdayDto);
        }

        [HttpDelete("birthdays/{id}")]
        public async Task<IActionResult> DeleteBirthday([FromRoute] string id)
        {
            _log.LogDebug($"REST request to delete Birthday : {id}");
            await _birthdayService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

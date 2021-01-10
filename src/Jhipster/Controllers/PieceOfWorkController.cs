
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
    public class PieceOfWorkController : ControllerBase
    {
        private const string EntityName = "pieceOfWork";
        private readonly IMapper _mapper;
        private readonly IPieceOfWorkService _pieceOfWorkService;
        private readonly ILogger<PieceOfWorkController> _log;

        public PieceOfWorkController(ILogger<PieceOfWorkController> log,
            IMapper mapper,
            IPieceOfWorkService pieceOfWorkService)
        {
            _log = log;
            _mapper = mapper;
            _pieceOfWorkService = pieceOfWorkService;
        }

        [HttpPost("piece-of-works")]
        [ValidateModel]
        public async Task<ActionResult<PieceOfWorkDto>> CreatePieceOfWork([FromBody] PieceOfWorkDto pieceOfWorkDto)
        {
            _log.LogDebug($"REST request to save PieceOfWork : {pieceOfWorkDto}");
            if (pieceOfWorkDto.Id != 0)
                throw new BadRequestAlertException("A new pieceOfWork cannot already have an ID", EntityName, "idexists");

            PieceOfWork pieceOfWork = _mapper.Map<PieceOfWork>(pieceOfWorkDto);
            await _pieceOfWorkService.Save(pieceOfWork);
            return CreatedAtAction(nameof(GetPieceOfWork), new { id = pieceOfWork.Id }, pieceOfWork)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, pieceOfWork.Id.ToString()));
        }

        [HttpPut("piece-of-works")]
        [ValidateModel]
        public async Task<IActionResult> UpdatePieceOfWork([FromBody] PieceOfWorkDto pieceOfWorkDto)
        {
            _log.LogDebug($"REST request to update PieceOfWork : {pieceOfWorkDto}");
            if (pieceOfWorkDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            PieceOfWork pieceOfWork = _mapper.Map<PieceOfWork>(pieceOfWorkDto);
            await _pieceOfWorkService.Save(pieceOfWork);
            return Ok(pieceOfWork)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, pieceOfWork.Id.ToString()));
        }

        [HttpGet("piece-of-works")]
        public async Task<ActionResult<IEnumerable<PieceOfWorkDto>>> GetAllPieceOfWorks(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of PieceOfWorks");
            var result = await _pieceOfWorkService.FindAll(pageable);
            var page = new Page<PieceOfWorkDto>(result.Content.Select(entity => _mapper.Map<PieceOfWorkDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<PieceOfWorkDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("piece-of-works/{id}")]
        public async Task<IActionResult> GetPieceOfWork([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get PieceOfWork : {id}");
            var result = await _pieceOfWorkService.FindOne(id);
            PieceOfWorkDto pieceOfWorkDto = _mapper.Map<PieceOfWorkDto>(result);
            return ActionResultUtil.WrapOrNotFound(pieceOfWorkDto);
        }

        [HttpDelete("piece-of-works/{id}")]
        public async Task<IActionResult> DeletePieceOfWork([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete PieceOfWork : {id}");
            await _pieceOfWorkService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

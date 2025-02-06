
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
    [Route("api/piece-of-works")]
    [ApiController]
    public class PieceOfWorksController : ControllerBase
    {
        private const string EntityName = "pieceOfWork";
        private readonly ILogger<PieceOfWorksController> _log;
        private readonly IMapper _mapper;
        private readonly IPieceOfWorkService _pieceOfWorkService;

        public PieceOfWorksController(ILogger<PieceOfWorksController> log,
        IMapper mapper,
        IPieceOfWorkService pieceOfWorkService)
        {
            _log = log;
            _mapper = mapper;
            _pieceOfWorkService = pieceOfWorkService;
        }

        [HttpPost]
        public async Task<ActionResult<PieceOfWorkDto>> CreatePieceOfWork([FromBody] PieceOfWorkDto pieceOfWorkDto)
        {
            _log.LogDebug($"REST request to save PieceOfWork : {pieceOfWorkDto}");
            if (pieceOfWorkDto.Id != 0 && pieceOfWorkDto.Id != null)
                throw new BadRequestAlertException("A new pieceOfWork cannot already have an ID", EntityName, "idexists");

            PieceOfWork pieceOfWork = _mapper.Map<PieceOfWork>(pieceOfWorkDto);
            await _pieceOfWorkService.Save(pieceOfWork);
            return CreatedAtAction(nameof(GetPieceOfWork), new { id = pieceOfWork.Id }, pieceOfWork)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, pieceOfWork.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePieceOfWork(long? id, [FromBody] PieceOfWorkDto pieceOfWorkDto)
        {
            _log.LogDebug($"REST request to update PieceOfWork : {pieceOfWorkDto}");
            if (pieceOfWorkDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != pieceOfWorkDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            PieceOfWork pieceOfWork = _mapper.Map<PieceOfWork>(pieceOfWorkDto);
            await _pieceOfWorkService.Save(pieceOfWork);
            return Ok(pieceOfWork)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, pieceOfWork.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PieceOfWorkDto>>> GetAllPieceOfWorks(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of PieceOfWorks");
            var result = await _pieceOfWorkService.FindAll(pageable);
            var page = new Page<PieceOfWorkDto>(result.Content.Select(entity => _mapper.Map<PieceOfWorkDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<PieceOfWorkDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPieceOfWork([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get PieceOfWork : {id}");
            var result = await _pieceOfWorkService.FindOne(id);
            PieceOfWorkDto pieceOfWorkDto = _mapper.Map<PieceOfWorkDto>(result);
            return ActionResultUtil.WrapOrNotFound(pieceOfWorkDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePieceOfWork([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete PieceOfWork : {id}");
            await _pieceOfWorkService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

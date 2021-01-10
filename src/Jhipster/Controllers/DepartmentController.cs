
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
    public class DepartmentController : ControllerBase
    {
        private const string EntityName = "department";
        private readonly IMapper _mapper;
        private readonly IDepartmentService _departmentService;
        private readonly ILogger<DepartmentController> _log;

        public DepartmentController(ILogger<DepartmentController> log,
            IMapper mapper,
            IDepartmentService departmentService)
        {
            _log = log;
            _mapper = mapper;
            _departmentService = departmentService;
        }

        [HttpPost("departments")]
        [ValidateModel]
        public async Task<ActionResult<DepartmentDto>> CreateDepartment([FromBody] DepartmentDto departmentDto)
        {
            _log.LogDebug($"REST request to save Department : {departmentDto}");
            if (departmentDto.Id != 0)
                throw new BadRequestAlertException("A new department cannot already have an ID", EntityName, "idexists");

            Department department = _mapper.Map<Department>(departmentDto);
            await _departmentService.Save(department);
            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, department.Id.ToString()));
        }

        [HttpPut("departments")]
        [ValidateModel]
        public async Task<IActionResult> UpdateDepartment([FromBody] DepartmentDto departmentDto)
        {
            _log.LogDebug($"REST request to update Department : {departmentDto}");
            if (departmentDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Department department = _mapper.Map<Department>(departmentDto);
            await _departmentService.Save(department);
            return Ok(department)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, department.Id.ToString()));
        }

        [HttpGet("departments")]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAllDepartments(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Departments");
            var result = await _departmentService.FindAll(pageable);
            var page = new Page<DepartmentDto>(result.Content.Select(entity => _mapper.Map<DepartmentDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<DepartmentDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("departments/{id}")]
        public async Task<IActionResult> GetDepartment([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Department : {id}");
            var result = await _departmentService.FindOne(id);
            DepartmentDto departmentDto = _mapper.Map<DepartmentDto>(result);
            return ActionResultUtil.WrapOrNotFound(departmentDto);
        }

        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Department : {id}");
            await _departmentService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}


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
    [Route("api/departments")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private const string EntityName = "department";
        private readonly ILogger<DepartmentsController> _log;
        private readonly IMapper _mapper;
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(ILogger<DepartmentsController> log,
        IMapper mapper,
        IDepartmentService departmentService)
        {
            _log = log;
            _mapper = mapper;
            _departmentService = departmentService;
        }

        [HttpPost]
        public async Task<ActionResult<DepartmentDto>> CreateDepartment([FromBody] DepartmentDto departmentDto)
        {
            _log.LogDebug($"REST request to save Department : {departmentDto}");
            if (departmentDto.Id != 0 && departmentDto.Id != null)
                throw new BadRequestAlertException("A new department cannot already have an ID", EntityName, "idexists");

            Department department = _mapper.Map<Department>(departmentDto);
            await _departmentService.Save(department);
            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, department.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(long? id, [FromBody] DepartmentDto departmentDto)
        {
            _log.LogDebug($"REST request to update Department : {departmentDto}");
            if (departmentDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != departmentDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Department department = _mapper.Map<Department>(departmentDto);
            await _departmentService.Save(department);
            return Ok(department)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, department.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAllDepartments(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Departments");
            var result = await _departmentService.FindAll(pageable);
            var page = new Page<DepartmentDto>(result.Content.Select(entity => _mapper.Map<DepartmentDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<DepartmentDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartment([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get Department : {id}");
            var result = await _departmentService.FindOne(id);
            DepartmentDto departmentDto = _mapper.Map<DepartmentDto>(result);
            return ActionResultUtil.WrapOrNotFound(departmentDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete Department : {id}");
            await _departmentService.Delete(id);
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

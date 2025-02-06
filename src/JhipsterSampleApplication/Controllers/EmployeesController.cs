
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
    [Route("api/employees")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private const string EntityName = "employee";
        private readonly ILogger<EmployeesController> _log;
        private readonly IMapper _mapper;
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeesController(ILogger<EmployeesController> log,
        IMapper mapper,
        IEmployeeRepository employeeRepository)
        {
            _log = log;
            _mapper = mapper;
            _employeeRepository = employeeRepository;
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] EmployeeDto employeeDto)
        {
            _log.LogDebug($"REST request to save Employee : {employeeDto}");
            if (employeeDto.Id != 0 && employeeDto.Id != null)
                throw new BadRequestAlertException("A new employee cannot already have an ID", EntityName, "idexists");

            Employee employee = _mapper.Map<Employee>(employeeDto);
            await _employeeRepository.CreateOrUpdateAsync(employee);
            await _employeeRepository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, employee.Id.ToString()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(long? id, [FromBody] EmployeeDto employeeDto)
        {
            _log.LogDebug($"REST request to update Employee : {employeeDto}");
            if (employeeDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            if (id != employeeDto.Id) throw new BadRequestAlertException("Invalid Id", EntityName, "idinvalid");
            Employee employee = _mapper.Map<Employee>(employeeDto);
            await _employeeRepository.CreateOrUpdateAsync(employee);
            await _employeeRepository.SaveChangesAsync();
            return Ok(employee)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, employee.Id.ToString()));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAllEmployees(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Employees");
            var result = await _employeeRepository.QueryHelper()
                .Include(employee => employee.Manager)
                .Include(employee => employee.Department)
                .GetPageAsync(pageable);
            var page = new Page<EmployeeDto>(result.Content.Select(entity => _mapper.Map<EmployeeDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<EmployeeDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployee([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to get Employee : {id}");
            var result = await _employeeRepository.QueryHelper()
                .Include(employee => employee.Manager)
                .Include(employee => employee.Department)
                .GetOneAsync(employee => employee.Id == id);
            EmployeeDto employeeDto = _mapper.Map<EmployeeDto>(result);
            return ActionResultUtil.WrapOrNotFound(employeeDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee([FromRoute] long? id)
        {
            _log.LogDebug($"REST request to delete Employee : {id}");
            await _employeeRepository.DeleteByIdAsync(id);
            await _employeeRepository.SaveChangesAsync();
            return NoContent().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

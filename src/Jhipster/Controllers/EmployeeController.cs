
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
    public class EmployeeController : ControllerBase
    {
        private const string EntityName = "employee";
        private readonly IMapper _mapper;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ILogger<EmployeeController> _log;

        public EmployeeController(ILogger<EmployeeController> log,
            IMapper mapper,
            IEmployeeRepository employeeRepository)
        {
            _log = log;
            _mapper = mapper;
            _employeeRepository = employeeRepository;
        }

        [HttpPost("employees")]
        [ValidateModel]
        public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] EmployeeDto employeeDto)
        {
            _log.LogDebug($"REST request to save Employee : {employeeDto}");
            if (employeeDto.Id != 0)
                throw new BadRequestAlertException("A new employee cannot already have an ID", EntityName, "idexists");

            Employee employee = _mapper.Map<Employee>(employeeDto);
            await _employeeRepository.CreateOrUpdateAsync(employee);
            await _employeeRepository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, employee.Id.ToString()));
        }

        [HttpPut("employees")]
        [ValidateModel]
        public async Task<IActionResult> UpdateEmployee([FromBody] EmployeeDto employeeDto)
        {
            _log.LogDebug($"REST request to update Employee : {employeeDto}");
            if (employeeDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Employee employee = _mapper.Map<Employee>(employeeDto);
            await _employeeRepository.CreateOrUpdateAsync(employee);
            await _employeeRepository.SaveChangesAsync();
            return Ok(employee)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, employee.Id.ToString()));
        }

        [HttpGet("employees")]
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

        [HttpGet("employees/{id}")]
        public async Task<IActionResult> GetEmployee([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Employee : {id}");
            var result = await _employeeRepository.QueryHelper()
                .Include(employee => employee.Manager)
                .Include(employee => employee.Department)
                .GetOneAsync(employee => employee.Id == id);
            EmployeeDto employeeDto = _mapper.Map<EmployeeDto>(result);
            return ActionResultUtil.WrapOrNotFound(employeeDto);
        }

        [HttpDelete("employees/{id}")]
        public async Task<IActionResult> DeleteEmployee([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Employee : {id}");
            await _employeeRepository.DeleteByIdAsync(id);
            await _employeeRepository.SaveChangesAsync();
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

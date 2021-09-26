
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
    public class CategoryController : ControllerBase
    {
        private const string EntityName = "category";
        private readonly IMapper _mapper;
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _log;

        public CategoryController(ILogger<CategoryController> log,
            IMapper mapper,
            ICategoryService categoryService)
        {
            _log = log;
            _mapper = mapper;
            _categoryService = categoryService;
        }

        [HttpPost("categories")]
        [ValidateModel]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryDto categoryDto)
        {
            _log.LogDebug($"REST request to save Category : {categoryDto}");
            if (categoryDto.Id != 0)
                throw new BadRequestAlertException("A new category cannot already have an ID", EntityName, "idexists");

            Category category = _mapper.Map<Category>(categoryDto);
            await _categoryService.Save(category);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category)
                .WithHeaders(HeaderUtil.CreateEntityCreationAlert(EntityName, category.Id.ToString()));
        }

        [HttpPut("categories")]
        [ValidateModel]
        public async Task<IActionResult> UpdateCategory([FromBody] CategoryDto categoryDto)
        {
            _log.LogDebug($"REST request to update Category : {categoryDto}");
            if (categoryDto.Id == 0) throw new BadRequestAlertException("Invalid Id", EntityName, "idnull");
            Category category = _mapper.Map<Category>(categoryDto);
            await _categoryService.Save(category);
            return Ok(category)
                .WithHeaders(HeaderUtil.CreateEntityUpdateAlert(EntityName, category.Id.ToString()));
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories(IPageable pageable)
        {
            _log.LogDebug("REST request to get a page of Categories");
            var result = await _categoryService.FindAll(pageable);
            var page = new Page<CategoryDto>(result.Content.Select(entity => _mapper.Map<CategoryDto>(entity)).ToList(), pageable, result.TotalElements);
            return Ok(((IPage<CategoryDto>)page).Content).WithHeaders(page.GeneratePaginationHttpHeaders());
        }

        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategory([FromRoute] long id)
        {
            _log.LogDebug($"REST request to get Category : {id}");
            var result = await _categoryService.FindOne(id);
            CategoryDto categoryDto = _mapper.Map<CategoryDto>(result);
            return ActionResultUtil.WrapOrNotFound(categoryDto);
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory([FromRoute] long id)
        {
            _log.LogDebug($"REST request to delete Category : {id}");
            await _categoryService.Delete(id);
            return Ok().WithHeaders(HeaderUtil.CreateEntityDeletionAlert(EntityName, id.ToString()));
        }
    }
}

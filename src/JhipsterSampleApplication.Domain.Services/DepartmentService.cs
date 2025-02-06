using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Services.Interfaces;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JhipsterSampleApplication.Domain.Services;

public class DepartmentService : IDepartmentService
{
    protected readonly IDepartmentRepository _departmentRepository;

    public DepartmentService(IDepartmentRepository departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public virtual async Task<Department> Save(Department department)
    {
        await _departmentRepository.CreateOrUpdateAsync(department);
        await _departmentRepository.SaveChangesAsync();
        return department;
    }

    public virtual async Task<IPage<Department>> FindAll(IPageable pageable)
    {
        var page = await _departmentRepository.QueryHelper()
            .Include(department => department.Location)
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<Department> FindOne(long? id)
    {
        var result = await _departmentRepository.QueryHelper()
            .Include(department => department.Location)
            .GetOneAsync(department => department.Id == id);
        return result;
    }

    public virtual async Task Delete(long? id)
    {
        await _departmentRepository.DeleteByIdAsync(id);
        await _departmentRepository.SaveChangesAsync();
    }
}

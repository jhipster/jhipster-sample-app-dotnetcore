
using AutoMapper;
using System.Linq;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Dto;


namespace JhipsterSampleApplication.Configuration.AutoMapper
{

    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(userDto => userDto.Roles, opt => opt.MapFrom(user => user.UserRoles.Select(iur => iur.Role.Name).ToHashSet()))
            .ReverseMap()
                .ForPath(user => user.UserRoles, opt => opt.MapFrom(userDto => userDto.Roles.Select(role => new UserRole { Role = new Role { Name = role }, UserId = userDto.Id }).ToHashSet()));

            CreateMap<Country, CountryDto>().ReverseMap();
            CreateMap<Department, DepartmentDto>().ReverseMap();
            CreateMap<Employee, EmployeeDto>().ReverseMap();
            CreateMap<Job, JobDto>().ReverseMap();
            CreateMap<JobHistory, JobHistoryDto>().ReverseMap();
            CreateMap<Location, LocationDto>().ReverseMap();
            CreateMap<PieceOfWork, PieceOfWorkDto>().ReverseMap();
            CreateMap<Region, RegionDto>().ReverseMap();
            CreateMap<TimeSheet, TimeSheetDto>().ReverseMap();
            CreateMap<TimeSheetEntry, TimeSheetEntryDto>().ReverseMap();
        }
    }
}

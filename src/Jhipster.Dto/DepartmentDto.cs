using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Jhipster.Dto
{

    public class DepartmentDto
    {

        public long Id { get; set; }

        [Required]
        public string DepartmentName { get; set; }
        public long? LocationId { get; set; }

        public IList<EmployeeDto> Employees { get; set; } = new List<EmployeeDto>();


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

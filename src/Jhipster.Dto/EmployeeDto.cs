using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Jhipster.Dto {

    public class EmployeeDto {

        public long Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime HireDate { get; set; }
        public long? Salary { get; set; }
        public long? CommissionPct { get; set; }
        public IList<JobDto> Jobs { get; set; } = new List<JobDto>();

        public EmployeeDto Manager { get; set; }

        public DepartmentDto Department { get; set; }


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

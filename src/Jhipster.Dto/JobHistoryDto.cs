using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Jhipster.Crosscutting.Enums;

namespace Jhipster.Dto
{

    public class JobHistoryDto
    {

        public long Id { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Language Language { get; set; }
        public long? JobId { get; set; }

        public long? DepartmentId { get; set; }

        public long? EmployeeId { get; set; }


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JhipsterSampleApplication.Dto
{

    public class TimeSheetDto
    {
        public Guid? Id { get; set; }
        public DateTime? TimeSheetDate { get; set; }
        public long? EmployeeId { get; set; }
        public EmployeeDto Employee { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

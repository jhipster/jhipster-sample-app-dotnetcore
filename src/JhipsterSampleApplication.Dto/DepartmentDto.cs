using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JhipsterSampleApplication.Dto
{

    public class DepartmentDto
    {
        public long? Id { get; set; }
        [Required]
        public string DepartmentName { get; set; }
        public long? LocationId { get; set; }
        public LocationDto Location { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Jhipster.Dto
{

    public class JobDto
    {

        public long Id { get; set; }

        public string JobTitle { get; set; }
        public long? MinSalary { get; set; }
        public long? MaxSalary { get; set; }

        public IList<PieceOfWorkDto> Chores { get; set; } = new List<PieceOfWorkDto>();

        public long? EmployeeId { get; set; }


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

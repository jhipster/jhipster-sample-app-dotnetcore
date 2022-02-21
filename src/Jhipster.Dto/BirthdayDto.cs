using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Jhipster.Dto
{

    public class BirthdayDto
    {

        public string Id { get; set; }
        public string Lname { get; set; }
        public string Fname { get; set; }
        public DateTime Dob{ get; set; }
        public string Sign { get; set; }
        public bool IsAlive { get; set; }
        public List<CategoryDto> Categories { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

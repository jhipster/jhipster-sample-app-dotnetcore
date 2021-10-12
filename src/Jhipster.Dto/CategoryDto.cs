using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Jhipster.Dto
{

    public class CategoryDto
    {

        public long Id { get; set; }

        public string CategoryName { get; set; }
        public bool selected { get; set; }
        public bool notCategorized { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

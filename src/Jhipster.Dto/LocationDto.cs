using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Jhipster.Dto
{

    public class LocationDto
    {
        public long Id { get; set; }
        public string StreetAddress { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public string StateProvince { get; set; }
        public long? CountryId { get; set; }
        public CountryDto Country { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

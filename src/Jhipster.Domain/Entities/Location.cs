using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhipster.Domain.Entities
{
    [Table("location")]
    public class Location : BaseEntity<long>
    {
        public string StreetAddress { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public string StateProvince { get; set; }
        public long? CountryId { get; set; }
        public Country Country { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var location = obj as Location;
            if (location?.Id == null || location?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, location.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Location{" +
                    $"ID='{Id}'" +
                    $", StreetAddress='{StreetAddress}'" +
                    $", PostalCode='{PostalCode}'" +
                    $", City='{City}'" +
                    $", StateProvince='{StateProvince}'" +
                    "}";
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhipster.Domain {
    [Table("country")]
    public class Country {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public string CountryName { get; set; }
        public Region Region { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var country = obj as Country;
            if (country?.Id == null || country?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, country.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Country{" +
                    $"ID='{Id}'" +
                    $", CountryName='{CountryName}'" +
                    "}";
        }
    }
}

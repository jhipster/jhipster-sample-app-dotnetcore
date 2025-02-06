using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JhipsterSampleApplication.Domain.Entities
{
    [Table("region")]
    public class Region : BaseEntity<long?>
    {
        public string? RegionName { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var region = obj as Region;
            if (region?.Id == null || region?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Equals(Id, region.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Region{" +
                    $"ID='{Id}'" +
                    $", RegionName='{RegionName}'" +
                    "}";
        }
    }
}

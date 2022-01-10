using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Jhipster.Domain
{
    [Table("ruleset")]
    public class Ruleset
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public string Name { get; set; }
        public string JsonString { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var ruleset = obj as Ruleset;
            if (ruleset?.Id == null || ruleset?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, ruleset.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Ruleset{" +
                    $"ID='{Id}'" +
                    $", Name='{Name}'" +
                    $", JsonString='{JsonString}'" +
                    "}";
        }
    }
}

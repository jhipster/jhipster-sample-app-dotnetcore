using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhipster.Domain
{
    [Table("birthday")]
    public class Birthday
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public string Lname { get; set; }
        public string Fname { get; set; }
        public DateTime? Dob { get; set; }
        public bool? IsAlive { get; set; }
        public string Optional { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var birthday = obj as Birthday;
            if (birthday?.Id == null || birthday?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, birthday.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Birthday{" +
                    $"ID='{Id}'" +
                    $", Lname='{Lname}'" +
                    $", Fname='{Fname}'" +
                    $", Dob='{Dob}'" +
                    $", IsAlive='{IsAlive}'" +
                    $", Optional='{Optional}'" +
                    "}";
        }
    }
}

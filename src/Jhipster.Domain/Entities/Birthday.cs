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
        public string Id { get; set; }
        public string Lname { get; set; }
        public string Fname { get; set; }
        public DateTime Dob{ get; set; }
        public string Sign { get; set; }
        public bool IsAlive { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var birthday = obj as Birthday;
            if (birthday?.Id == null || birthday?.Id == "" || Id == "") return false;
            return EqualityComparer<string>.Default.Equals(Id, birthday.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }


        public override string ToString()
        {
            return "Birthday{" +
                    $"Lname='{Lname}'" +
                    $", Fname='{Fname}'" +
                    $", Dob={Dob.ToString("d")}" +
                    $", Sign='{Sign}'" +
                    $", IsAlive={(IsAlive ? "true" : "false")}" +
                "}";
        }
    }   
}

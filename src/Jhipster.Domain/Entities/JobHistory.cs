using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Jhipster.Crosscutting.Enums;

namespace Jhipster.Domain {
    [Table("job_history")]
    public class JobHistory {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Language? Language { get; set; }
        public Job Job { get; set; }

        public Department Department { get; set; }

        public Employee Employee { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var jobHistory = obj as JobHistory;
            if (jobHistory?.Id == null || jobHistory?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, jobHistory.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "JobHistory{" +
                    $"ID='{Id}'" +
                    $", StartDate='{StartDate}'" +
                    $", EndDate='{EndDate}'" +
                    $", Language='{Language}'" +
                    "}";
        }
    }
}

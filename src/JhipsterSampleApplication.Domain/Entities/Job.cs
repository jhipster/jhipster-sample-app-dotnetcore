using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace JhipsterSampleApplication.Domain.Entities
{
    [Table("job")]
    public class Job : BaseEntity<long?>
    {
        public string? JobTitle { get; set; }
        public long? MinSalary { get; set; }
        public long? MaxSalary { get; set; }
        public IList<PieceOfWork> Chores { get; set; } = new List<PieceOfWork>();
        public long? EmployeeId { get; set; }
        public Employee Employee { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var job = obj as Job;
            if (job?.Id == null || job?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Equals(Id, job.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Job{" +
                    $"ID='{Id}'" +
                    $", JobTitle='{JobTitle}'" +
                    $", MinSalary='{MinSalary}'" +
                    $", MaxSalary='{MaxSalary}'" +
                    "}";
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JhipsterSampleApplication.Domain.Entities
{
    [Table("time_sheet")]
    public class TimeSheet : BaseEntity<Guid?>
    {
        public DateTime? TimeSheetDate { get; set; }
        public IList<TimeSheetEntry> TimeSheetEntries { get; set; } = new List<TimeSheetEntry>();
        public long? EmployeeId { get; set; }
        public Employee Employee { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var timeSheet = obj as TimeSheet;
            if (timeSheet?.Id == null || Id == null) return false;
            return EqualityComparer<Guid>.Equals(Id!, timeSheet.Id!);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "TimeSheet{" +
                    $"ID='{Id}'" +
                    $", TimeSheetDate='{TimeSheetDate}'" +
                    "}";
        }
    }
}

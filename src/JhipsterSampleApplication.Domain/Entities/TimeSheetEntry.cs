using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JhipsterSampleApplication.Domain.Entities
{
    [Table("time_sheet_entry")]
    public class TimeSheetEntry : BaseEntity<long?>
    {
        public string? ActivityName { get; set; }
        public int? StartTimeMilitary { get; set; }
        public int? EndTimeMilitary { get; set; }
        public decimal? TotalTime { get; set; }
        public Guid? TimeSheetId { get; set; }
        public TimeSheet TimeSheet { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var timeSheetEntry = obj as TimeSheetEntry;
            if (timeSheetEntry?.Id == null || timeSheetEntry?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Equals(Id, timeSheetEntry.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "TimeSheetEntry{" +
                    $"ID='{Id}'" +
                    $", ActivityName='{ActivityName}'" +
                    $", StartTimeMilitary='{StartTimeMilitary}'" +
                    $", EndTimeMilitary='{EndTimeMilitary}'" +
                    $", TotalTime='{TotalTime}'" +
                    "}";
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JhipsterSampleApplication.Dto
{

    public class TimeSheetEntryDto
    {
        public long? Id { get; set; }
        public string? ActivityName { get; set; }
        public int? StartTimeMilitary { get; set; }
        public int? EndTimeMilitary { get; set; }
        public decimal? TotalTime { get; set; }
        public Guid? TimeSheetId { get; set; }
        public TimeSheetDto TimeSheet { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

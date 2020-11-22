using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Jhipster.Dto {

    public class PieceOfWorkDto {

        public long Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }

        [JsonIgnore]
        public IList<JobDto> Jobs { get; set; } = new List<JobDto>();


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

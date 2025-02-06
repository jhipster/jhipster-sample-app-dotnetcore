using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace JhipsterSampleApplication.Dto
{

    public class PieceOfWorkDto
    {
        public long? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

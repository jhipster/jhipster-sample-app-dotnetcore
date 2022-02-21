using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Jhipster.Dto
{

    public class RulesetDto
    {

        public long Id { get; set; }

        public string Name { get; set; }
        public string JsonString { get; set; }
        public string Description { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}

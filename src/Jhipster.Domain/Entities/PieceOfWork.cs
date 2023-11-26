using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Jhipster.Domain.Entities
{
    [Table("piece_of_work")]
    public class PieceOfWork : BaseEntity<long>
    {
        public string Title { get; set; }
        public string Description { get; set; }
        [JsonIgnore]
        public IList<Job> Jobs { get; set; } = new List<Job>();

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var pieceOfWork = obj as PieceOfWork;
            if (pieceOfWork?.Id == null || pieceOfWork?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, pieceOfWork.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "PieceOfWork{" +
                    $"ID='{Id}'" +
                    $", Title='{Title}'" +
                    $", Description='{Description}'" +
                    "}";
        }
    }
}

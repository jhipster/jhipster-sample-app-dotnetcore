using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jhipster.Domain
{
    [Table("category")]
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public string CategoryName { get; set; }
        public bool selected {get; set;} 
        public bool notCategorized {get; set;}
        public string focusId {get; set;}
        public FocusType focusType {get; set;}
        public string jsonString {get; set;}

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var category = obj as Category;
            if (category?.Id == null || category?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, category.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Category{" +
                    $"ID='{Id}'" +
                    $", CategoryName='{CategoryName}'" +
                    $", selected = {selected}" +
                    $", notCategorized = {notCategorized}" +
                    "}";
        }
    }

    public enum FocusType {
        NONE,
        FOCUS,
        REFERENCESTO,
        REFERENCESFROM
    }
}

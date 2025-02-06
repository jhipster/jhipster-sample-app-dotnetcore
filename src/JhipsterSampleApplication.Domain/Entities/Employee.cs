using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JhipsterSampleApplication.Domain.Entities
{
    [Table("employee")]
    public class Employee : BaseEntity<long?>
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime HireDate { get; set; }
        public long? Salary { get; set; }
        public long? CommissionPct { get; set; }
        public IList<Job> Jobs { get; set; } = new List<Job>();
        public IList<TimeSheet> TimeSheets { get; set; } = new List<TimeSheet>();
        public long? ManagerId { get; set; }
        public Employee Manager { get; set; }
        public long? DepartmentId { get; set; }
        public Department Department { get; set; }

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var employee = obj as Employee;
            if (employee?.Id == null || employee?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Equals(Id, employee.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Employee{" +
                    $"ID='{Id}'" +
                    $", FirstName='{FirstName}'" +
                    $", LastName='{LastName}'" +
                    $", Email='{Email}'" +
                    $", PhoneNumber='{PhoneNumber}'" +
                    $", HireDate='{HireDate}'" +
                    $", Salary='{Salary}'" +
                    $", CommissionPct='{CommissionPct}'" +
                    "}";
        }
    }
}

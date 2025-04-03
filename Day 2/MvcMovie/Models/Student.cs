using System.ComponentModel.DataAnnotations;

namespace MvcMovie.Models;

public class Student
{
    public int Id { get; set; }
    public string? FullName { get; set; }
    
    [DataType(DataType.Date)]
    public DateTime DateOfBirth { get; set; }
    
    public string? Major { get; set; }
    public decimal GPA { get; set; }
}

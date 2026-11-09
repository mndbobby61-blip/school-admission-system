namespace SchoolAdmission.Models;

public class Hold
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClassId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Status { get; set; } = "HELD"; // HELD, CONFIRMED, CANCELLED (EXPIRED হিসাব করে বের হয়)
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
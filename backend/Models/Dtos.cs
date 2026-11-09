namespace SchoolAdmission.Models;

public record CreateClassRequest(string? Name, int? TotalSeats);

public record ClassDto(string Id, string Name, int TotalSeats, int HeldSeats, int ConfirmedSeats)
{
    public int AvailableSeats => TotalSeats - HeldSeats - ConfirmedSeats;
}

public record HoldDto(string HoldId, string ClassId, string ClassName, string StudentId, string Status, string ExpiresAt);

public record MyHoldDto(string HoldId, string ClassId, string ClassName, string Status, string ExpiresAt);
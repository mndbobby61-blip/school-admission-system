using System.Data;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Data;
using SchoolAdmission.Models;

namespace SchoolAdmission.Services;

public class AdmissionService
{
    private readonly AppDbContext _db;
    private readonly int _holdSeconds;

    public AdmissionService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _holdSeconds = int.TryParse(config["HOLD_DURATION_SECONDS"], out var s) && s > 0 ? s : 600;
    }

    public static string Iso(DateTime d) => d.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss'Z'");

    // মেয়াদ পেরোলে HELD আসলে EXPIRED। কোনো background job লাগে না।
    public static string EffectiveStatus(Hold h, DateTime now) =>
        h.Status == "HELD" && h.ExpiresAt <= now ? "EXPIRED" : h.Status;

    private static IResult Err(int code, string msg) => Results.Json(new { error = msg }, statusCode: code);

    private async Task<ClassEntity?> LockClass(Guid id) =>
        (await _db.Classes
            .FromSqlInterpolated($"SELECT * FROM classes WHERE \"Id\" = {id} FOR UPDATE")
            .ToListAsync()).FirstOrDefault();

    private async Task<Hold?> LockHold(Guid id) =>
        (await _db.Holds
            .FromSqlInterpolated($"SELECT * FROM holds WHERE \"Id\" = {id} FOR UPDATE")
            .ToListAsync()).FirstOrDefault();

    public async Task<List<ClassDto>> LoadClasses(Guid? id = null)
    {
        var now = DateTime.UtcNow;
        var q = _db.Classes.AsQueryable();
        if (id != null) q = q.Where(c => c.Id == id);

        return await q.OrderBy(c => c.Name).Select(c => new ClassDto(
            c.Id.ToString(),
            c.Name,
            c.TotalSeats,
            _db.Holds.Count(h => h.ClassId == c.Id && h.Status == "HELD" && h.ExpiresAt > now),
            _db.Holds.Count(h => h.ClassId == c.Id && h.Status == "CONFIRMED")
        )).ToListAsync();
    }

    public async Task<IResult> CreateHold(string classId, string studentId)
    {
        if (!Guid.TryParse(classId, out var cid)) return Err(404, "Class পাওয়া যায়নি।");

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        // Class-এর row lock: একই class-এর সব hold request লাইন ধরে একটা একটা করে চলবে
        var cls = await LockClass(cid);
        if (cls == null) return Err(404, "Class পাওয়া যায়নি।");

        var now = DateTime.UtcNow;
        var activeQuery = _db.Holds.Where(h => h.ClassId == cid &&
            ((h.Status == "HELD" && h.ExpiresAt > now) || h.Status == "CONFIRMED"));

        if (await activeQuery.AnyAsync(h => h.StudentId == studentId))
            return Err(409, "এই শিক্ষার্থীর এই class-এ আগে থেকেই একটা আবেদন আছে।");

        if (await activeQuery.CountAsync() >= cls.TotalSeats)
            return Err(409, "দুঃখিত, এই class-এ কোনো seat খালি নেই।");

        var hold = new Hold
        {
            ClassId = cid,
            StudentId = studentId,
            Status = "HELD",
            ExpiresAt = now.AddSeconds(_holdSeconds),
            CreatedAt = now
        };
        _db.Holds.Add(hold);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return Results.Created($"/holds/{hold.Id}", ToDto(hold, cls.Name, now));
    }

    public async Task<IResult> GetHold(string holdId, string studentId)
    {
        if (!Guid.TryParse(holdId, out var hid)) return Err(404, "আবেদন পাওয়া যায়নি।");
        var h = await _db.Holds.AsNoTracking().FirstOrDefaultAsync(x => x.Id == hid);
        if (h == null || h.StudentId != studentId) return Err(404, "আবেদন পাওয়া যায়নি।");

        var name = await _db.Classes.Where(c => c.Id == h.ClassId).Select(c => c.Name).FirstAsync();
        return Results.Ok(ToDto(h, name, DateTime.UtcNow));
    }

    public async Task<IResult> Confirm(string holdId, string studentId)
    {
        if (!Guid.TryParse(holdId, out var hid)) return Err(404, "আবেদন পাওয়া যায়নি।");

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        var h = await LockHold(hid);
        if (h == null || h.StudentId != studentId) return Err(404, "আবেদন পাওয়া যায়নি।");

        // আগেই confirm হয়ে থাকলে আবার confirm করলেও কিছু বাড়বে না
        if (h.Status == "CONFIRMED")
            return Results.Ok(new { holdId = h.Id.ToString(), status = "CONFIRMED" });

        if (h.Status != "HELD")
            return Err(409, "এই আবেদন আর confirm করা যাবে না।");

        if (h.ExpiresAt <= DateTime.UtcNow)
            return Err(409, "আবেদনের মেয়াদ শেষ হয়ে গেছে। আবার আবেদন করুন।");

        h.Status = "CONFIRMED";
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        return Results.Ok(new { holdId = h.Id.ToString(), status = "CONFIRMED" });
    }

    public async Task<IResult> Cancel(string holdId, string studentId)
    {
        if (!Guid.TryParse(holdId, out var hid)) return Err(404, "আবেদন পাওয়া যায়নি।");

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        var h = await LockHold(hid);
        if (h == null || h.StudentId != studentId) return Err(404, "আবেদন পাওয়া যায়নি।");

        if (h.Status == "CANCELLED") return Results.NoContent();
        if (h.Status == "CONFIRMED") return Err(409, "নিশ্চিত হওয়া ভর্তি বাতিল করা যাবে না।");
        if (h.ExpiresAt <= DateTime.UtcNow) return Err(409, "আবেদনের মেয়াদ আগেই শেষ হয়ে গেছে।");

        h.Status = "CANCELLED";
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        return Results.NoContent();
    }

    public async Task<List<MyHoldDto>> MyHolds(string studentId)
    {
        var now = DateTime.UtcNow;
        var rows = await (from h in _db.Holds.AsNoTracking()
                          join c in _db.Classes on h.ClassId equals c.Id
                          where h.StudentId == studentId
                          orderby h.CreatedAt descending
                          select new { h, c.Name }).ToListAsync();

        return rows.Select(r => new MyHoldDto(
            r.h.Id.ToString(), r.h.ClassId.ToString(), r.Name,
            EffectiveStatus(r.h, now), Iso(r.h.ExpiresAt))).ToList();
    }

    private static HoldDto ToDto(Hold h, string className, DateTime now) => new(
        h.Id.ToString(), h.ClassId.ToString(), className, h.StudentId,
        EffectiveStatus(h, now), Iso(h.ExpiresAt));
}
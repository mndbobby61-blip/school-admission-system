using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Data;
using SchoolAdmission.Models;
using SchoolAdmission.Services;

var builder = WebApplication.CreateBuilder(args);

var conn = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=school;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(conn));
builder.Services.AddScoped<AdmissionService>();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler(a => a.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    await ctx.Response.WriteAsJsonAsync(new { error = "Server-এ সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।" });
}));
app.UseCors();

// Database তৈরি (database চালু হতে দেরি হলে আবার চেষ্টা করবে)
for (var i = 0; i < 30; i++)
{
    try
    {
        using var scope = app.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
        break;
    }
    catch
    {
        if (i == 29) throw;
        Thread.Sleep(2000);
    }
}

static bool TryStudent(HttpRequest req, out string id)
{
    id = req.Headers["X-Student-Id"].ToString().Trim();
    return Regex.IsMatch(id, @"^\d{17}$");
}

static IResult BadStudent() =>
    Results.BadRequest(new { error = "জন্ম নিবন্ধন নম্বর ঠিক ১৭ অঙ্কের হতে হবে।" });

// 1. নতুন class
app.MapPost("/classes", async (CreateClassRequest req, AppDbContext db) =>
{
    var name = req.Name?.Trim();
    if (string.IsNullOrEmpty(name))
        return Results.BadRequest(new { error = "Class-এর নাম দিতে হবে।" });
    if (req.TotalSeats is null || req.TotalSeats <= 0)
        return Results.BadRequest(new { error = "Seat সংখ্যা ১ বা তার বেশি হতে হবে।" });

    var c = new ClassEntity { Name = name, TotalSeats = req.TotalSeats.Value };
    db.Classes.Add(c);
    await db.SaveChangesAsync();
    return Results.Created($"/classes/{c.Id}",
        new { id = c.Id.ToString(), name = c.Name, totalSeats = c.TotalSeats });
});

// 2. সব class
app.MapGet("/classes", async (AdmissionService svc) => Results.Ok(await svc.LoadClasses()));

// 3. একটা class
app.MapGet("/classes/{classId}", async (string classId, AdmissionService svc) =>
{
    if (!Guid.TryParse(classId, out var id)) return Results.NotFound(new { error = "Class পাওয়া যায়নি।" });
    var list = await svc.LoadClasses(id);
    return list.Count == 0 ? Results.NotFound(new { error = "Class পাওয়া যায়নি।" }) : Results.Ok(list[0]);
});

// 4. আবেদন (seat hold)
app.MapPost("/classes/{classId}/holds", async (string classId, HttpRequest req, AdmissionService svc) =>
{
    if (!TryStudent(req, out var sid)) return BadStudent();
    return await svc.CreateHold(classId, sid);
});

// 5. আবেদনের অবস্থা
app.MapGet("/holds/{holdId}", async (string holdId, HttpRequest req, AdmissionService svc) =>
{
    if (!TryStudent(req, out var sid)) return BadStudent();
    return await svc.GetHold(holdId, sid);
});

// 6. ভর্তি ফি জমা (confirm)
app.MapPost("/holds/{holdId}/confirm", async (string holdId, HttpRequest req, AdmissionService svc) =>
{
    if (!TryStudent(req, out var sid)) return BadStudent();
    return await svc.Confirm(holdId, sid);
});

// 7. আবেদন বাতিল
app.MapDelete("/holds/{holdId}", async (string holdId, HttpRequest req, AdmissionService svc) =>
{
    if (!TryStudent(req, out var sid)) return BadStudent();
    return await svc.Cancel(holdId, sid);
});

// 8. এই শিক্ষার্থীর সব আবেদন
app.MapGet("/me/holds", async (HttpRequest req, AdmissionService svc) =>
{
    if (!TryStudent(req, out var sid)) return BadStudent();
    return Results.Ok(await svc.MyHolds(sid));
});

app.Run();
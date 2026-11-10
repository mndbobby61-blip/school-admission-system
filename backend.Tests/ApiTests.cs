using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace SchoolAdmission.Tests;

public class ApiTests
{
    static readonly string BaseUrl = Environment.GetEnvironmentVariable("API_URL") ?? "http://localhost:8080";

    static readonly HttpClient Http = new(new SocketsHttpHandler { MaxConnectionsPerServer = 300 })
    {
        BaseAddress = new Uri(BaseUrl),
        Timeout = TimeSpan.FromSeconds(90)
    };

    static string Student(int n) => "2015" + n.ToString("D13"); // ১৭ অঙ্ক

    static async Task WaitForApi()
    {
        for (var i = 0; i < 90; i++)
        {
            try
            {
                var r = await Http.GetAsync("/classes");
                if (r.IsSuccessStatusCode) return;
            }
            catch { /* এখনো চালু হয়নি */ }
            await Task.Delay(1000);
        }
        throw new Exception("Backend চালু হয়নি।");
    }

    static async Task<string> CreateClass(int seats)
    {
        var r = await Http.PostAsJsonAsync("/classes", new { name = "Test " + Guid.NewGuid(), totalSeats = seats });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        var json = await r.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("id").GetString()!;
    }

    static Task<HttpResponseMessage> Send(HttpMethod m, string url, string? student)
    {
        var req = new HttpRequestMessage(m, url);
        if (student != null) req.Headers.Add("X-Student-Id", student);
        return Http.SendAsync(req);
    }

    static Task<HttpResponseMessage> Hold(string classId, string student) =>
        Send(HttpMethod.Post, $"/classes/{classId}/holds", student);

    static async Task<JsonElement> GetClass(string classId) =>
        await Http.GetFromJsonAsync<JsonElement>($"/classes/{classId}");

    [Fact]
    public async Task Concurrent_holds_never_exceed_total_seats()
    {
        await WaitForApi();
        const int seats = 20;
        const int requests = 200;
        var classId = await CreateClass(seats);

        var tasks = Enumerable.Range(1, requests)
            .Select(i => Task.Run(() => Hold(classId, Student(i))))
            .ToArray();
        var responses = await Task.WhenAll(tasks);

        var created = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
        var conflict = responses.Count(r => r.StatusCode == HttpStatusCode.Conflict);

        Assert.Equal(seats, created);
        Assert.Equal(requests - seats, conflict);

        var c = await GetClass(classId);
        Assert.Equal(seats, c.GetProperty("heldSeats").GetInt32());
        Assert.Equal(0, c.GetProperty("availableSeats").GetInt32());
    }

    [Fact]
    public async Task Same_student_cannot_hold_twice_in_same_class()
    {
        await WaitForApi();
        var classId = await CreateClass(5);

        var first = await Hold(classId, Student(1));
        var second = await Hold(classId, Student(1));

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Confirming_twice_counts_only_once()
    {
        await WaitForApi();
        var classId = await CreateClass(5);

        var h = await Hold(classId, Student(7));
        var holdId = (await h.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("holdId").GetString()!;

        var c1 = await Send(HttpMethod.Post, $"/holds/{holdId}/confirm", Student(7));
        var c2 = await Send(HttpMethod.Post, $"/holds/{holdId}/confirm", Student(7));
        Assert.Equal(HttpStatusCode.OK, c1.StatusCode);
        Assert.Equal(HttpStatusCode.OK, c2.StatusCode);

        var c = await GetClass(classId);
        Assert.Equal(1, c.GetProperty("confirmedSeats").GetInt32());
        Assert.Equal(0, c.GetProperty("heldSeats").GetInt32());
    }

    [Fact]
    public async Task Invalid_student_id_is_rejected()
    {
        await WaitForApi();
        var classId = await CreateClass(5);
        var r = await Hold(classId, "123");
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }
}
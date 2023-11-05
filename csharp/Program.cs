using System.Text.RegularExpressions;
using TailedLive;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddCors();
var app = builder.Build();

app.UseCors();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseStaticFiles();

app.Map("/", (HttpContext context) =>
{
    context.Response.Redirect(Environment.GetEnvironmentVariable("CUSTOM_HOMEPAGE") ??
                              "https://docs.tailed.live/");
});

#if DEBUG
    app.MapWhen(x => Regex.IsMatch(x.Request.Path.ToString(), @"^/[a-zA-Z0-9_\-=~]{22}$"), 
    config =>
    {
        // Load index.html on each request so changes to Svelte are picked up.
        config.Run(async context => await context.Response.WriteAsync(await File.ReadAllTextAsync("wwwroot/index.html")));
    });

    app.MapHub<TailHub>("/api/tail")
        // Allow connections from Svelte.
        .RequireCors((policyBuilder) => policyBuilder
            .SetIsOriginAllowed(_ => true)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
#else
    var tailHtml = await File.ReadAllTextAsync("wwwroot/index.html");

    app.MapWhen(x => Regex.IsMatch(x.Request.Path.ToString(), @"^/[a-zA-Z0-9_\-=]{22}$"), 
    config =>
    {
        config.Run(async context => await context.Response.WriteAsync(tailHtml));
    });

    app.MapHub<TailHub>("/api/tail");
#endif

app.Run();

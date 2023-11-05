using Microsoft.AspNetCore.SignalR;

namespace TailedLive;

public class TailHub : Hub
{
    // ReSharper disable once UnusedMember.Global
    public async Task Join(string tailId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, tailId);
    }

    // ReSharper disable once UnusedMember.Global
    public async Task Leave(string tailId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, tailId);
    }

    // ReSharper disable once UnusedMember.Global
    public async Task SendData(string tailId, string data)
    {
        await Clients.Group(tailId).SendAsync("ReceiveData", data);
    }

    // ReSharper disable once UnusedMember.Global
    public Task NoOp()
    {
        return Task.CompletedTask;
    }
}
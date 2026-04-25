using Microsoft.EntityFrameworkCore;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Domain.Models;
using SmartApiary.Infrastructure.Persistence;

namespace SmartApiary.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly SmartApiaryDbContext _context;

    public NotificationRepository(SmartApiaryDbContext context)
    {
        _context = context;
    }

    public Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Notifications.FirstOrDefaultAsync(
            notification => notification.Id == id,
            cancellationToken);
    }

    public async Task<IReadOnlyList<Notification>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
    }

    public void Update(Notification notification)
    {
        _context.Notifications.Update(notification);
    }
}

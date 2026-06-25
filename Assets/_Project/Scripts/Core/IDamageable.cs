namespace LamGame
{
    /// <summary>
    /// Bất cứ thứ gì có thể nhận sát thương (Player, Enemy, thùng gỗ...) đều cài đặt interface này.
    /// Nhờ interface, hệ thống tấn công không cần biết cụ thể đang đánh ai — chỉ cần "đánh được là đánh".
    /// </summary>
    public interface IDamageable
    {
        Faction Faction { get; }
        bool IsAlive { get; }

        /// <summary>Nhận một đòn đánh. Trả về true nếu đòn đánh thực sự gây sát thương (để xử lý hiệu ứng).</summary>
        bool TakeDamage(in DamageInfo info);
    }
}

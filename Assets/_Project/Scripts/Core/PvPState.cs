namespace LamGame
{
    /// <summary>
    /// Trạng thái cờ đồ sát (PvP) của người chơi.
    /// - AnToan: không tham gia PvP, người chơi khác không đánh trúng được.
    /// - BatCoDoSat: bật cờ đỏ, có thể bị/đánh người chơi khác (nếu họ cũng bật cờ).
    /// </summary>
    public enum PvPState
    {
        AnToan,      // An toàn
        BatCoDoSat   // Bật cờ đồ sát
    }
}

namespace LamGame
{
    /// <summary>
    /// Phe của một thực thể — dùng để quyết định ai có thể đánh ai.
    /// (Quái không đánh quái, người chơi cùng phe chỉ đánh nhau khi bật cờ đồ sát...)
    /// </summary>
    public enum Faction
    {
        Player,   // Người chơi
        Enemy,    // Quái vật
        Neutral   // NPC, vật phá huỷ, bù nhìn tập đánh...
    }
}

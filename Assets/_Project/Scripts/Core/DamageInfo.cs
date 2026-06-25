using UnityEngine;

namespace LamGame
{
    /// <summary>
    /// Gói thông tin của một đòn đánh, truyền từ nguồn gây sát thương tới mục tiêu.
    /// Dùng readonly struct để TRÁNH SINH RÁC (GC) — đòn đánh xảy ra rất nhiều lần mỗi giây.
    /// </summary>
    public readonly struct DamageInfo
    {
        public readonly float Amount;            // Lượng sát thương
        public readonly GameObject Source;       // GameObject gây sát thương (ai đánh)
        public readonly Faction SourceFaction;   // Phe của nguồn
        public readonly bool SourcePvPEnabled;   // Nguồn có đang bật cờ đồ sát không
        public readonly Vector2 HitDirection;    // Hướng đòn đánh (dùng cho knockback / hiệu ứng)

        public DamageInfo(float amount, GameObject source, Faction faction, bool pvpEnabled, Vector2 hitDirection)
        {
            Amount = amount;
            Source = source;
            SourceFaction = faction;
            SourcePvPEnabled = pvpEnabled;
            HitDirection = hitDirection;
        }
    }
}

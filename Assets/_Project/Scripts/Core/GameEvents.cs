using System;
using UnityEngine;

namespace LamGame
{
    /// <summary>
    /// Kênh sự kiện toàn cục (Event Bus) giúp các hệ thống "nói chuyện" với nhau mà KHÔNG phụ thuộc trực tiếp.
    /// Ví dụ: Quái chết -> bắn sự kiện OnEnemyKilled -> QuestManager & hệ thống điểm tự nghe và xử lý.
    ///
    /// Ưu điểm: tách rời (decoupled), dễ mở rộng, dễ test.
    /// LƯU Ý: luôn huỷ đăng ký (-=) trong OnDisable/OnDestroy để tránh rò rỉ bộ nhớ (memory leak).
    /// </summary>
    public static class GameEvents
    {
        /// <summary>Một con quái vừa bị giết. Tham số: (mã loại quái, GameObject kẻ giết).</summary>
        public static event Action<string, GameObject> OnEnemyKilled;
        public static void EnemyKilled(string enemyId, GameObject killer) => OnEnemyKilled?.Invoke(enemyId, killer);

        /// <summary>Người chơi vừa nhặt được vật phẩm. Tham số: (vật phẩm, số lượng).</summary>
        public static event Action<ItemSO, int> OnItemCollected;
        public static void ItemCollected(ItemSO item, int amount) => OnItemCollected?.Invoke(item, amount);
    }
}

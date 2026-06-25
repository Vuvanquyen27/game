using UnityEngine;

namespace LamGame
{
    /// <summary>Phân loại vật phẩm.</summary>
    public enum ItemType { Consumable, Weapon, Material, Quest }

    /// <summary>
    /// (Placeholder tối thiểu) Dữ liệu một vật phẩm dạng ScriptableObject.
    /// Hiện chỉ đủ để hệ thống sự kiện (GameEvents) biên dịch được; sẽ mở rộng khi làm Inventory/Loot sau.
    /// Tạo asset: chuột phải trong Project -> Create -> LamGame -> Item.
    /// </summary>
    [CreateAssetMenu(fileName = "Item", menuName = "LamGame/Item")]
    public class ItemSO : ScriptableObject
    {
        public string id = "item_id";          // mã định danh duy nhất
        public string displayName = "Vật phẩm";
        [TextArea] public string description;
        public Sprite icon;
        public ItemType type = ItemType.Material;
        public bool stackable = true;
        [Min(1)] public int maxStack = 99;
    }
}

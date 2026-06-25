using UnityEngine;
using UnityEngine.Tilemaps;

namespace LamGame
{
    /// <summary>
    /// PHẦN 2 — Sinh một bản đồ TẠM bằng code để test đi lại & va chạm ngay, không cần vẽ tay bằng Tile Palette.
    /// - Lấp toàn bộ vùng bằng tile nền (ground).
    /// - Tạo tường viền + rải ngẫu nhiên vài ô vật cản (obstacle) để test va chạm.
    /// Gán 2 Tilemap và 2 Tile trong Inspector. Thiếu reference sẽ cảnh báo và bỏ qua (KHÔNG crash).
    ///
    /// LƯU Ý VA CHẠM: Tilemap "obstacle" cần có TilemapCollider2D (+ CompositeCollider2D + Rigidbody2D BodyType=Static)
    /// thì nhân vật mới đụng vào được. Xem hướng dẫn chi tiết trong phần trả lời.
    /// </summary>
    public class TestMapGenerator : MonoBehaviour
    {
        [Header("Tilemap (gán trong Editor)")]
        [SerializeField] private Tilemap groundTilemap;    // lớp nền (đi lên trên được)
        [SerializeField] private Tilemap obstacleTilemap;  // lớp vật cản (có collider)

        [Header("Tile (gán trong Editor)")]
        [SerializeField] private TileBase groundTile;
        [SerializeField] private TileBase obstacleTile;

        [Header("Kích thước bản đồ (số ô)")]
        [SerializeField] private int width = 40;
        [SerializeField] private int height = 30;

        [Header("Vật cản")]
        [Range(0f, 0.5f)]
        [SerializeField] private float obstacleChance = 0.08f; // ~8% số ô (trong ruột) là vật cản

        [Header("Tuỳ chọn")]
        [SerializeField] private bool generateOnStart = true;

        private void Start()
        {
            if (generateOnStart) Generate();
        }

        /// <summary>
        /// Sinh bản đồ. Có thể bấm chuột phải vào component trong Inspector -> "Generate" để chạy thử ngay trong Editor.
        /// </summary>
        [ContextMenu("Generate")]
        public void Generate()
        {
            if (groundTilemap == null || groundTile == null)
            {
                Debug.LogWarning("[TestMapGenerator] Chưa gán groundTilemap hoặc groundTile — bỏ qua sinh map.", this);
                return;
            }

            // Xoá map cũ trước khi sinh mới (cho phép sinh lại nhiều lần).
            groundTilemap.ClearAllTiles();
            if (obstacleTilemap != null) obstacleTilemap.ClearAllTiles();

            int halfW = width / 2;
            int halfH = height / 2;

            for (int x = -halfW; x < halfW; x++)
            {
                for (int y = -halfH; y < halfH; y++)
                {
                    var pos = new Vector3Int(x, y, 0);

                    // 1) Lấp nền khắp nơi.
                    groundTilemap.SetTile(pos, groundTile);

                    // Không có lớp/ tile vật cản thì bỏ qua phần tường.
                    if (obstacleTilemap == null || obstacleTile == null) continue;

                    bool isEdge = x == -halfW || x == halfW - 1 || y == -halfH || y == halfH - 1;
                    bool isSpawn = Mathf.Abs(x) <= 1 && Mathf.Abs(y) <= 1; // chừa chỗ spawn để không kẹt

                    // 2) Tường viền + rải vật cản ngẫu nhiên (trừ vùng spawn).
                    if (!isSpawn && (isEdge || Random.value < obstacleChance))
                        obstacleTilemap.SetTile(pos, obstacleTile);
                }
            }

            Debug.Log($"[TestMapGenerator] Đã sinh map {width}x{height}.", this);
        }
    }
}

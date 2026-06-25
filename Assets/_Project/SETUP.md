# Hướng dẫn dựng nền tảng game top-down 2D

> Chỉ có CODE trong repo này. Scene, sprite, prefab, Canvas... bạn tự dựng trong Unity Editor theo các bước dưới.

## Cấu trúc thư mục
```
Assets/_Project/
├── Scripts/
│   ├── Core/        Faction, PvPState, DamageInfo, IDamageable, GameEvents  (khung cho combat/PvP về sau)
│   ├── Data/        ItemSO  (ScriptableObject vật phẩm — placeholder)
│   ├── Player/      PlayerController, PlayerStats
│   ├── Camera/      CameraFollow
│   ├── World/       TestMapGenerator
│   └── UI/          HUDController
├── (tự tạo khi cần) ScriptableObjects/  Prefabs/  Sprites/  Scenes/  Animations/  Audio/
```

## PHẦN 1 — Player
1. Tạo GameObject `Player`, thêm: SpriteRenderer, Rigidbody2D, Collider2D (Box/Capsule), script `PlayerController`.
2. Rigidbody2D: Body Type = **Dynamic**, Interpolate = **Interpolate**. (gravityScale & freeze rotation script tự set.)
3. Đặt Tag = **Player** (để camera & nhặt đồ nhận diện).
4. Chỉnh `Move Speed` trong Inspector. Animator để trống cũng chạy.
5. Test: Play → WASD / mũi tên để đi 8 hướng; đi chéo không nhanh hơn đi thẳng.

## PHẦN 2 — Camera + Map
- Camera: gắn `CameraFollow` vào Main Camera (Projection = Orthographic, Z = -10). Kéo Player vào `Target` (hoặc để trống — tự tìm theo tag).
- Map test:
  1. GameObject → 2D Object → Tilemap → Rectangular. Tạo 2 Tilemap con: `Ground`, `Obstacles`.
  2. `Obstacles`: thêm **TilemapCollider2D**, **CompositeCollider2D** (tick *Used By Composite* trong TilemapCollider2D), Rigidbody2D Body Type = **Static**.
  3. Tạo GameObject rỗng, gắn `TestMapGenerator`. Kéo 2 Tilemap + 2 Tile (tự tạo từ sprite) vào.
  4. Play → map tự sinh, có tường viền + vật cản để test va chạm. (Hoặc chuột phải component → Generate.)

## PHẦN 3 — HUD
1. Tạo PlayerStats: gắn script `PlayerStats` vào Player.
2. Canvas: GameObject → UI → Canvas. Thêm 2 Slider (HP, Energy) — Min 0, Max 1, bỏ Handle, Interactable = off.
3. Gắn `HUDController` lên Canvas. Kéo Player(PlayerStats) vào `Player Stats`, kéo 2 Slider vào `Hp Slider` / `Energy Slider`.
4. Test: Play → nhấn **K** (-10 HP), **L** (+10 HP), **J** (-10 Energy), **H** (+10 Energy). Thanh phải chạy.

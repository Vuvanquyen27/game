using UnityEngine;

namespace LamGame
{
    /// <summary>
    /// PHẦN 1 — Di chuyển nhân vật 8 hướng cho game top-down (kiểu Stardew Valley).
    /// WASD và phím mũi tên đều dùng được (trục Horizontal/Vertical mặc định của Unity đã map sẵn cả hai).
    /// Top-down: KHÔNG có trọng lực (gravityScale = 0). Di chuyển bằng Rigidbody2D.MovePosition để va chạm mượt với vật cản.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Di chuyển")]
        [Tooltip("Tốc độ di chuyển (đơn vị/giây). Chỉnh trực tiếp trong Inspector.")]
        public float moveSpeed = 5f;

        [Header("Animator (tuỳ chọn — có thể để trống)")]
        [Tooltip("Kéo Animator vào nếu đã có. KHÔNG có Animator vẫn chạy bình thường.")]
        [SerializeField] private Animator animator;

        /// <summary>Hướng quay gần nhất (mặc định nhìn xuống) — dùng cho animation idle theo hướng & hướng tấn công sau này.</summary>
        public Vector2 LastDirection { get; private set; } = Vector2.down;
        /// <summary>Input di chuyển hiện tại (đã chuẩn hoá).</summary>
        public Vector2 MoveInput { get; private set; }
        /// <summary>Cho phép khoá di chuyển (khi mở UI, đang tấn công...).</summary>
        public bool CanMove { get; set; } = true;

        private Rigidbody2D _rb;

        // Cache hash của parameter Animator để tối ưu (tránh so sánh chuỗi mỗi frame).
        private static readonly int HashMoveX = Animator.StringToHash("MoveX");
        private static readonly int HashMoveY = Animator.StringToHash("MoveY");
        private static readonly int HashSpeed = Animator.StringToHash("Speed");

        private void Awake()
        {
            _rb = GetComponent<Rigidbody2D>();

            // Cấu hình chuẩn cho top-down 2D:
            _rb.gravityScale = 0f;                                          // không rơi
            _rb.freezeRotation = true;                                      // không bị xoay khi va chạm
            _rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous; // va chạm chính xác hơn

            // Nếu chưa gán Animator trong Inspector, thử tự tìm (không bắt buộc phải có).
            if (animator == null)
                animator = GetComponentInChildren<Animator>();
        }

        private void Update()
        {
            // Đọc input mỗi frame. GetAxisRaw -> dừng tức thì, không trượt (hợp game top-down).
            float x = Input.GetAxisRaw("Horizontal"); // A/D + mũi tên trái/phải
            float y = Input.GetAxisRaw("Vertical");   // W/S + mũi tên lên/xuống
            Vector2 input = new Vector2(x, y);

            // Chuẩn hoá để đi chéo KHÔNG nhanh hơn đi thẳng.
            if (input.sqrMagnitude > 1f)
                input.Normalize();

            MoveInput = input;

            // Lưu hướng quay gần nhất khi đang thực sự di chuyển.
            if (input.sqrMagnitude > 0.0001f)
                LastDirection = input;

            UpdateAnimator(input);
        }

        private void FixedUpdate()
        {
            // Di chuyển trong FixedUpdate (đồng bộ vật lý). MovePosition giúp va chạm mượt với tường.
            Vector2 velocity = CanMove ? MoveInput * moveSpeed : Vector2.zero;
            _rb.MovePosition(_rb.position + velocity * Time.fixedDeltaTime);
        }

        /// <summary>Cập nhật Animator nếu có — null-check an toàn, thiếu Animator vẫn chạy.</summary>
        private void UpdateAnimator(Vector2 input)
        {
            if (animator == null) return;

            // Chỉ set MoveX/MoveY khi đang di chuyển để giữ đúng hướng idle khi dừng.
            if (input.sqrMagnitude > 0.0001f)
            {
                animator.SetFloat(HashMoveX, input.x);
                animator.SetFloat(HashMoveY, input.y);
            }
            animator.SetFloat(HashSpeed, input.sqrMagnitude); // 0 khi đứng yên, >0 khi đi
        }
    }
}

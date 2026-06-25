using UnityEngine;

namespace LamGame
{
    /// <summary>
    /// PHẦN 2 — Camera bám theo mục tiêu (nhân vật) cho game top-down, làm mượt nhẹ bằng SmoothDamp.
    /// Giữ nguyên trục Z của camera (2D nhìn từ trên xuống cần Z âm cố định, ví dụ -10).
    /// An toàn khi chưa gán target: tự tìm Player theo tag, nếu vẫn không có thì đứng yên (không crash).
    /// </summary>
    public class CameraFollow : MonoBehaviour
    {
        [Header("Mục tiêu")]
        [Tooltip("Đối tượng camera bám theo (thường là Player). Gán trong Inspector hoặc gọi SetTarget().")]
        [SerializeField] private Transform target;

        [Header("Thiết lập")]
        [Tooltip("Độ trễ làm mượt. Càng NHỎ camera bám càng nhanh (0 = bám tức thì).")]
        [SerializeField] private float smoothTime = 0.15f;
        [Tooltip("Độ lệch so với mục tiêu theo trục X, Y. Z luôn giữ cố định.")]
        [SerializeField] private Vector2 offset = Vector2.zero;

        private Vector3 _velocity;  // bộ đệm nội bộ cho SmoothDamp
        private float _fixedZ;      // Z cố định của camera

        private void Awake()
        {
            _fixedZ = transform.position.z; // ghi nhớ Z ban đầu (vd -10)
        }

        private void Start()
        {
            // Tự tìm Player theo tag nếu chưa gán (an toàn, không bắt buộc).
            if (target == null)
            {
                GameObject player = GameObject.FindWithTag("Player");
                if (player != null) target = player.transform;
            }
        }

        /// <summary>Đổi mục tiêu camera lúc runtime (vd khi đổi nhân vật điều khiển).</summary>
        public void SetTarget(Transform newTarget) => target = newTarget;

        // LateUpdate: chạy SAU khi nhân vật đã di chuyển xong trong frame -> camera không bị giật.
        private void LateUpdate()
        {
            if (target == null) return;

            Vector3 desired = new Vector3(
                target.position.x + offset.x,
                target.position.y + offset.y,
                _fixedZ);

            transform.position = Vector3.SmoothDamp(transform.position, desired, ref _velocity, smoothTime);
        }
    }
}

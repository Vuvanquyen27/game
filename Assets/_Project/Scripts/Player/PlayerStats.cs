using System;
using UnityEngine;

namespace LamGame
{
    /// <summary>
    /// PHẦN 3 — Chỉ số runtime của người chơi: Máu (HP) và Năng lượng (Energy).
    /// Bắn sự kiện OnStatsChanged mỗi khi giá trị đổi -> HUD tự cập nhật (KHÔNG cần đọc mỗi frame).
    /// Tất cả thay đổi đều đi qua hàm -> luôn được Clamp trong [0, max], không bao giờ âm/tràn.
    /// </summary>
    public class PlayerStats : MonoBehaviour
    {
        [Header("Máu (HP)")]
        [SerializeField] private float maxHP = 100f;
        [SerializeField] private float currentHP = 100f;

        [Header("Năng lượng (Energy)")]
        [SerializeField] private float maxEnergy = 100f;
        [SerializeField] private float currentEnergy = 100f;

        [Header("Phím test (để kiểm tra HUD; xoá khi không cần)")]
        [SerializeField] private bool enableTestKeys = true;

        /// <summary>Báo "chỉ số đã thay đổi" — HUD lắng nghe để vẽ lại thanh.</summary>
        public event Action OnStatsChanged;
        /// <summary>Báo người chơi chết (HP về 0).</summary>
        public event Action OnDied;

        // Thuộc tính đọc nhanh cho UI / hệ thống khác.
        public float MaxHP => maxHP;
        public float CurrentHP => currentHP;
        public float MaxEnergy => maxEnergy;
        public float CurrentEnergy => currentEnergy;
        public float HPPercent => maxHP > 0f ? currentHP / maxHP : 0f;
        public float EnergyPercent => maxEnergy > 0f ? currentEnergy / maxEnergy : 0f;
        public bool IsAlive => currentHP > 0f;

        private void Start()
        {
            // Đảm bảo giá trị hợp lệ và cập nhật HUD lần đầu.
            currentHP = Mathf.Clamp(currentHP, 0f, maxHP);
            currentEnergy = Mathf.Clamp(currentEnergy, 0f, maxEnergy);
            OnStatsChanged?.Invoke();
        }

        // ---------- MÁU ----------
        /// <summary>Thay đổi HP theo lượng delta (âm = mất máu, dương = hồi máu).</summary>
        public void ChangeHP(float delta)
        {
            if (Mathf.Approximately(delta, 0f)) return;
            currentHP = Mathf.Clamp(currentHP + delta, 0f, maxHP);
            OnStatsChanged?.Invoke();
            if (currentHP <= 0f) OnDied?.Invoke();
        }
        public void TakeDamage(float amount) => ChangeHP(-Mathf.Abs(amount));
        public void Heal(float amount) => ChangeHP(Mathf.Abs(amount));

        // ---------- NĂNG LƯỢNG ----------
        public void ChangeEnergy(float delta)
        {
            if (Mathf.Approximately(delta, 0f)) return;
            currentEnergy = Mathf.Clamp(currentEnergy + delta, 0f, maxEnergy);
            OnStatsChanged?.Invoke();
        }
        /// <summary>Tiêu hao năng lượng. Trả về false nếu KHÔNG đủ (để chặn hành động tốn sức).</summary>
        public bool TryUseEnergy(float amount)
        {
            amount = Mathf.Abs(amount);
            if (currentEnergy < amount) return false;
            ChangeEnergy(-amount);
            return true;
        }

        // ---------- PHÍM TEST ----------
        private void Update()
        {
            if (!enableTestKeys) return;
            if (Input.GetKeyDown(KeyCode.K)) TakeDamage(10f);     // K: trừ 10 máu
            if (Input.GetKeyDown(KeyCode.L)) Heal(10f);           // L: hồi 10 máu
            if (Input.GetKeyDown(KeyCode.J)) ChangeEnergy(-10f);  // J: trừ 10 năng lượng
            if (Input.GetKeyDown(KeyCode.H)) ChangeEnergy(10f);   // H: hồi 10 năng lượng
        }
    }
}

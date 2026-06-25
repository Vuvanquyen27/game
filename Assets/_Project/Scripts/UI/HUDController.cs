using UnityEngine;
using UnityEngine.UI;

namespace LamGame
{
    /// <summary>
    /// PHẦN 3 — Cập nhật thanh HP và Energy trên Canvas theo PlayerStats.
    /// Script CHỈ tham chiếu & cập nhật UI — Canvas/phần tử UI bạn tự dựng trong Editor rồi kéo vào các field.
    /// Hỗ trợ cả Slider lẫn Image (Image Type = Filled). Để TRỐNG cái không dùng.
    /// Đăng ký sự kiện OnStatsChanged để chỉ vẽ lại khi cần (không update mỗi frame -> tối ưu).
    /// An toàn khi thiếu reference: chỗ nào null thì bỏ qua, không crash.
    /// </summary>
    public class HUDController : MonoBehaviour
    {
        [Header("Nguồn dữ liệu")]
        [SerializeField] private PlayerStats playerStats;

        [Header("Thanh HP (dùng Slider HOẶC Image Filled)")]
        [SerializeField] private Slider hpSlider;
        [SerializeField] private Image hpFillImage;
        [SerializeField] private Text hpText;       // (tuỳ chọn) chữ "80/100"

        [Header("Thanh Energy (dùng Slider HOẶC Image Filled)")]
        [SerializeField] private Slider energySlider;
        [SerializeField] private Image energyFillImage;
        [SerializeField] private Text energyText;   // (tuỳ chọn)

        private void Awake()
        {
            // Tự tìm PlayerStats nếu chưa gán (an toàn — vẫn nên gán tay trong Editor).
            // Unity 6 dùng FindFirstObjectByType thay cho FindObjectOfType (đã lỗi thời).
            if (playerStats == null)
                playerStats = FindFirstObjectByType<PlayerStats>();
        }

        private void OnEnable()
        {
            if (playerStats != null)
            {
                playerStats.OnStatsChanged += Refresh;
                Refresh(); // vẽ lần đầu cho khớp giá trị hiện tại
            }
        }

        private void OnDisable()
        {
            // Huỷ đăng ký để tránh rò rỉ bộ nhớ.
            if (playerStats != null)
                playerStats.OnStatsChanged -= Refresh;
        }

        /// <summary>Vẽ lại toàn bộ HUD theo chỉ số hiện tại.</summary>
        private void Refresh()
        {
            if (playerStats == null) return;

            SetBar(hpSlider, hpFillImage, hpText,
                playerStats.CurrentHP, playerStats.MaxHP, playerStats.HPPercent);

            SetBar(energySlider, energyFillImage, energyText,
                playerStats.CurrentEnergy, playerStats.MaxEnergy, playerStats.EnergyPercent);
        }

        // Hàm dùng chung cho cả 2 thanh — null-check từng phần.
        private static void SetBar(Slider slider, Image fill, Text label, float current, float max, float percent)
        {
            if (slider != null) slider.value = percent;       // Slider: Min Value 0, Max Value 1
            if (fill != null) fill.fillAmount = percent;      // Image: fillAmount 0..1
            if (label != null) label.text = $"{Mathf.CeilToInt(current)}/{Mathf.CeilToInt(max)}";
        }
    }
}

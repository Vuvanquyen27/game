import type { Metadata } from 'next';
import Link from 'next/link';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Chính sách quyền riêng tư',
  description: `Chính sách quyền riêng tư của ${brand.name}: chúng tôi thu thập dữ liệu tối thiểu, không lưu địa chỉ IP thô và tôn trọng quyền của bạn.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            Chính sách quyền riêng tư
          </h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật lần cuối: 08/07/2026
          </p>
        </header>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {brand.name} tôn trọng quyền riêng tư của bạn. Chúng tôi vận hành theo
          nguyên tắc thu thập dữ liệu ở mức tối thiểu — chỉ những gì thực sự cần
          thiết để website hoạt động và để cải thiện trải nghiệm của bạn.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            1. Dữ liệu chúng tôi thu thập
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="font-semibold text-foreground">
                Không lưu địa chỉ IP thô.
              </strong>{' '}
              Để chống lạm dụng và giới hạn tần suất truy cập, chúng tôi chỉ lưu{' '}
              <em>giá trị băm (hash) một chiều</em> của địa chỉ IP, không thể
              dùng để khôi phục lại IP gốc.
            </li>
            <li>
              <strong className="font-semibold text-foreground">
                Cookie phiên.
              </strong>{' '}
              Chúng tôi dùng cookie kỹ thuật cần thiết cho hoạt động của website
              (ví dụ ghi nhớ tùy chọn giao diện sáng/tối). Chúng tôi không dùng
              cookie để theo dõi bạn xuyên trang web khác.
            </li>
            <li>
              <strong className="font-semibold text-foreground">
                Thống kê lượt nhấn nội bộ.
              </strong>{' '}
              Khi bạn nhấn vào một liên kết sản phẩm, chúng tôi ghi nhận lượt
              nhấp ẩn danh (sản phẩm nào, nguồn truy cập nào) để hiểu ưu đãi nào
              hữu ích. Dữ liệu này không gắn với danh tính cá nhân của bạn.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            2. Cách chúng tôi sử dụng dữ liệu
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Dữ liệu ẩn danh được dùng để vận hành và bảo vệ website, đo lường
            mức độ quan tâm tới các sản phẩm, và cải thiện nội dung tuyển chọn.
            Chúng tôi{' '}
            <strong className="font-semibold text-foreground">
              không bán, không cho thuê
            </strong>{' '}
            dữ liệu của bạn cho bên thứ ba.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            3. Dịch vụ của bên thứ ba
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Khi bạn nhấn “Xem ưu đãi”, bạn sẽ rời khỏi website của chúng tôi để
            tới nền tảng bán hàng (Shopee, Lazada, TikTok Shop, Amazon…). Các nền
            tảng này có chính sách quyền riêng tư riêng và có thể đặt cookie
            affiliate của họ. Chúng tôi khuyến nghị bạn đọc chính sách của họ khi
            mua hàng.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            4. Quyền của bạn
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Vì chúng tôi không thu thập thông tin định danh cá nhân, chúng tôi
            không lưu hồ sơ gắn với bạn. Bạn có thể xóa cookie của website bất cứ
            lúc nào qua trình duyệt. Nếu bạn có câu hỏi hoặc yêu cầu liên quan
            đến dữ liệu, vui lòng liên hệ với chúng tôi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            5. Liên hệ
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Mọi thắc mắc về chính sách này, bạn có thể liên hệ với chúng tôi qua
            các kênh mạng xã hội được liệt kê trong{' '}
            <Link href="/links" className="font-medium text-primary underline">
              trang link-in-bio
            </Link>
            .
          </p>
        </section>

        <p className="border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          Xem thêm{' '}
          <Link
            href="/affiliate-disclosure"
            className="font-medium text-primary underline"
          >
            Công bố liên kết tiếp thị
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

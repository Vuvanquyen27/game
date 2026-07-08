import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateNotice } from '@/components/shared/affiliate-notice';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Công bố liên kết tiếp thị',
  description: `Công bố đầy đủ về liên kết tiếp thị (affiliate) trên ${brand.name}: hoa hồng không làm tăng giá bạn phải trả.`,
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            Công bố liên kết tiếp thị
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            Sự minh bạch là điều quan trọng với chúng tôi. Trang này giải thích
            rõ cách {brand.name} kiếm tiền và điều đó có ý nghĩa gì với bạn.
          </p>
        </header>

        <AffiliateNotice />

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Liên kết tiếp thị là gì?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {brand.name} tham gia các chương trình tiếp thị liên kết (affiliate)
            của nhiều nền tảng thương mại điện tử. Điều này có nghĩa là một số
            liên kết trên website là liên kết tiếp thị: khi bạn nhấn vào và mua
            hàng, chúng tôi có thể nhận được một khoản hoa hồng từ nền tảng bán
            hàng.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Hoa hồng không làm tăng giá của bạn
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Đây là điều quan trọng nhất:{' '}
            <strong className="font-semibold text-foreground">
              bạn không phải trả thêm bất kỳ khoản nào
            </strong>{' '}
            khi mua qua liên kết của chúng tôi. Khoản hoa hồng do nền tảng bán
            hàng chi trả cho chúng tôi từ phần lợi nhuận của họ, hoàn toàn tách
            biệt với số tiền bạn thanh toán. Giá sản phẩm với bạn là như nhau dù
            có đi qua liên kết của chúng tôi hay không.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Các nền tảng chúng tôi hợp tác
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Chúng tôi giới thiệu sản phẩm và ưu đãi từ các nền tảng bao gồm nhưng
            không giới hạn:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="font-semibold text-foreground">Shopee</strong>{' '}
              — thông qua Shopee Affiliate Program.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Lazada</strong>{' '}
              — thông qua Lazada Affiliate Program.
            </li>
            <li>
              <strong className="font-semibold text-foreground">
                TikTok Shop
              </strong>{' '}
              — thông qua chương trình tiếp thị liên kết của TikTok Shop.
            </li>
            <li>
              Và một số nền tảng khác khi phù hợp với sản phẩm được giới thiệu.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Cam kết của chúng tôi
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Việc có hoa hồng không ảnh hưởng đến tính khách quan trong lựa chọn
            sản phẩm của chúng tôi. Chúng tôi tuyển chọn dựa trên chất lượng và
            mức độ hữu ích cho bạn. Mọi thông tin về giá chỉ mang tính tham khảo
            tại thời điểm đăng và có thể thay đổi trên nền tảng bán hàng — vui
            lòng kiểm tra giá cuối cùng tại trang bán trước khi mua.
          </p>
        </section>

        <p className="border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          Xem thêm{' '}
          <Link href="/about" className="font-medium text-primary underline">
            Giới thiệu
          </Link>{' '}
          và{' '}
          <Link href="/privacy" className="font-medium text-primary underline">
            Chính sách quyền riêng tư
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

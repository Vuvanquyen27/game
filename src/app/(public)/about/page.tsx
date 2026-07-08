import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description: `Tìm hiểu về ${brand.name} — sứ mệnh, cách chúng tôi tuyển chọn sản phẩm và cách website hoạt động.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            Giới thiệu về {brand.name}
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {brand.description}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Chúng tôi là ai
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {brand.name} là một website tổng hợp và giới thiệu sản phẩm theo mô
            hình tiếp thị liên kết (affiliate). Chúng tôi dành thời gian tìm
            kiếm, sàng lọc và tuyển chọn những sản phẩm chất lượng cùng các ưu
            đãi tốt từ nhiều nền tảng thương mại điện tử uy tín như Shopee,
            Lazada, TikTok Shop và Amazon, rồi trình bày lại một cách gọn gàng,
            dễ so sánh để bạn tiết kiệm thời gian mua sắm.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Sứ mệnh của chúng tôi
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Chúng tôi tin rằng mua sắm thông minh không chỉ là mua được giá rẻ,
            mà là chọn đúng sản phẩm phù hợp với nhu cầu. Sứ mệnh của chúng tôi
            là giúp bạn ra quyết định nhanh và tự tin hơn thông qua thông tin
            minh bạch, hình ảnh rõ ràng và các liên kết dẫn thẳng tới nơi bán
            chính thức.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Cách website hoạt động
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Chúng tôi tuyển chọn sản phẩm và tổng hợp thông tin (hình ảnh, giá
              tham khảo, mô tả, nền tảng bán).
            </li>
            <li>
              Khi bạn nhấn nút “Xem ưu đãi”, bạn được chuyển tới trang bán hàng
              chính thức trên nền tảng tương ứng để hoàn tất giao dịch.
            </li>
            <li>
              Nếu bạn mua hàng qua liên kết của chúng tôi, chúng tôi có thể nhận
              được một khoản hoa hồng nhỏ từ nền tảng —{' '}
              <strong className="font-semibold text-foreground">
                giá bạn phải trả hoàn toàn không thay đổi
              </strong>
              .
            </li>
            <li>
              Mọi giao dịch, thanh toán, vận chuyển và chính sách đổi trả đều do
              nền tảng bán hàng và người bán chịu trách nhiệm.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Kết nối với chúng tôi
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Theo dõi chúng tôi trên mạng xã hội để không bỏ lỡ những ưu đãi mới
            nhất, hoặc khám phá toàn bộ sản phẩm được tuyển chọn ngay trên
            website.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild>
              <Link href="/products">Khám phá sản phẩm</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/links">Trang link-in-bio</Link>
            </Button>
          </div>
        </section>

        <p className="border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          Xem thêm{' '}
          <Link
            href="/affiliate-disclosure"
            className="font-medium text-primary underline"
          >
            Công bố liên kết tiếp thị
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

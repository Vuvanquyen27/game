'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Ban,
  Copy,
  Clock,
  ExternalLink,
  Instagram,
  Loader2,
  Send,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product, SocialPostWithProduct } from '@/types';
import {
  SOCIAL_POST_STATUS_LABELS,
  type SocialPlatform,
  type SocialPostStatus,
} from '@/lib/constants';
import { buildCaption } from '@/lib/social/caption';
import { formatDateTime } from '@/lib/format';
import {
  cancelSocialPost,
  createSocialPost,
  deleteSocialPost,
  duplicateSocialPost,
  publishSocialPostNow,
} from '@/actions/social';
import { brand } from '@/lib/brand';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThreadsIcon } from '@/components/shared/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from '@/components/admin/field';

type ComposerProduct = Pick<
  Product,
  | 'id'
  | 'title'
  | 'slug'
  | 'image_url'
  | 'price'
  | 'original_price'
  | 'currency'
  | 'copywriting'
  | 'short_description'
  | 'cta_text'
>;

const statusVariant: Record<
  SocialPostStatus,
  'success' | 'warning' | 'muted' | 'destructive' | 'secondary'
> = {
  published: 'success',
  scheduled: 'secondary',
  publishing: 'warning',
  draft: 'muted',
  failed: 'destructive',
  cancelled: 'muted',
};

export function SocialManager({
  products,
  posts,
  connection,
  siteUrl,
}: {
  products: ComposerProduct[];
  posts: SocialPostWithProduct[];
  connection: { instagram: boolean; threads: boolean };
  siteUrl: string;
}) {
  const router = useRouter();
  const [platform, setPlatform] = React.useState<SocialPlatform>('instagram');
  const [productId, setProductId] = React.useState<string>('');
  const [caption, setCaption] = React.useState('');
  const [mediaUrl, setMediaUrl] = React.useState('');
  const [scheduledAt, setScheduledAt] = React.useState('');
  const [pending, startTransition] = React.useTransition();

  const selectedProduct = products.find((p) => p.id === productId);
  const connected = connection[platform];

  function targetUrl(slug: string) {
    return `${siteUrl}/go/${slug}?source=${platform}`;
  }

  function generateCaption() {
    if (!selectedProduct) {
      toast.error('Hãy chọn sản phẩm trước');
      return;
    }
    const text = buildCaption({
      title: selectedProduct.title,
      price: selectedProduct.price,
      originalPrice: selectedProduct.original_price,
      currency: selectedProduct.currency,
      shortDescription: selectedProduct.short_description,
      copywriting: selectedProduct.copywriting,
      ctaText: selectedProduct.cta_text,
      targetUrl: targetUrl(selectedProduct.slug),
      platform,
    });
    setCaption(text);
    if (!mediaUrl && selectedProduct.image_url)
      setMediaUrl(selectedProduct.image_url);
    toast.success('Đã tạo caption mẫu');
  }

  function buildPayload(status: SocialPostStatus) {
    return {
      product_id: productId || '',
      platform,
      post_type: (mediaUrl ? 'image' : 'link') as 'image' | 'link',
      caption,
      media_url: mediaUrl,
      target_url: selectedProduct ? targetUrl(selectedProduct.slug) : '',
      status,
      scheduled_at: status === 'scheduled' ? scheduledAt : '',
    };
  }

  function resetComposer() {
    setCaption('');
    setMediaUrl('');
    setScheduledAt('');
    setProductId('');
  }

  function saveDraft() {
    if (!caption.trim()) return toast.error('Nội dung trống');
    startTransition(async () => {
      const r = await createSocialPost(buildPayload('draft'));
      if (r.ok) {
        toast.success('Đã lưu nháp');
        resetComposer();
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function schedule() {
    if (!caption.trim()) return toast.error('Nội dung trống');
    if (!scheduledAt) return toast.error('Chọn thời điểm đăng');
    startTransition(async () => {
      const r = await createSocialPost(buildPayload('scheduled'));
      if (r.ok) {
        toast.success('Đã lên lịch');
        resetComposer();
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function publishNow() {
    if (!caption.trim()) return toast.error('Nội dung trống');
    startTransition(async () => {
      const created = await createSocialPost(buildPayload('draft'));
      if (!created.ok) {
        toast.error(created.error);
        return;
      }
      const pub = await publishSocialPostNow(created.data.id);
      if (pub.ok) {
        toast.success('Đã đăng thành công');
        resetComposer();
      } else {
        toast.error(pub.error);
      }
      router.refresh();
    });
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success('Đã copy caption');
    } catch {
      toast.error('Không copy được');
    }
  }

  function rowAction(promise: Promise<{ ok: boolean; error?: string }>, msg: string) {
    startTransition(async () => {
      const r = await promise;
      if (r.ok) {
        toast.success(msg);
        router.refresh();
      } else toast.error(r.error ?? 'Lỗi');
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* Composer */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Soạn bài</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nền tảng">
                <Select
                  value={platform}
                  onValueChange={(v) => setPlatform(v as SocialPlatform)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="threads">Threads</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Sản phẩm">
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={generateCaption}
              disabled={!productId}
            >
              <Wand2 className="size-4" /> Tạo caption mẫu
            </Button>

            <Field label="Nội dung">
              <Textarea
                rows={10}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Nội dung bài đăng (đã kèm disclosure tiếp thị khi tạo mẫu)..."
                className="text-sm"
              />
            </Field>

            <Field label="URL ảnh (media)" hint="Instagram bắt buộc có ảnh.">
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>

            <Field label="Lên lịch (tùy chọn)">
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveDraft} variant="outline" disabled={pending}>
                Lưu nháp
              </Button>
              <Button onClick={schedule} variant="outline" disabled={pending}>
                <Clock className="size-4" /> Đặt lịch
              </Button>
              {connected ? (
                <Button onClick={publishNow} disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Đăng ngay
                </Button>
              ) : (
                <Button onClick={copyCaption} variant="pine" disabled={!caption}>
                  <Copy className="size-4" /> Copy để đăng thủ công
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch sử bài đăng</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Chưa có bài nào.
              </p>
            ) : (
              <ul className="divide-y">
                {posts.map((post) => (
                  <li key={post.id} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 text-muted-foreground">
                      {post.platform === 'instagram' ? (
                        <Instagram className="size-4" />
                      ) : (
                        <ThreadsIcon className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariant[post.status]}>
                          {SOCIAL_POST_STATUS_LABELS[post.status]}
                        </Badge>
                        {post.product && (
                          <span className="text-xs text-muted-foreground">
                            {post.product.title}
                          </span>
                        )}
                        {post.scheduled_at && post.status === 'scheduled' && (
                          <span className="text-xs text-muted-foreground">
                            · {formatDateTime(post.scheduled_at)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">
                        {post.caption}
                      </p>
                      {post.last_error && (
                        <p className="mt-1 text-xs text-destructive">
                          Lỗi: {post.last_error}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {connection[post.platform] &&
                        (post.status === 'draft' ||
                          post.status === 'failed') && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Đăng ngay"
                            onClick={() =>
                              rowAction(
                                publishSocialPostNow(post.id),
                                'Đã đăng',
                              )
                            }
                          >
                            <Send className="size-4" />
                          </Button>
                        )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Nhân bản"
                        onClick={() =>
                          rowAction(duplicateSocialPost(post.id), 'Đã nhân bản')
                        }
                      >
                        <Copy className="size-4" />
                      </Button>
                      {post.status === 'scheduled' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Hủy"
                          onClick={() =>
                            rowAction(cancelSocialPost(post.id), 'Đã hủy')
                          }
                        >
                          <Ban className="size-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Xóa"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Xóa bài viết này?'))
                            rowAction(deleteSocialPost(post.id), 'Đã xóa');
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar: trạng thái kết nối */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trạng thái kết nối</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ConnRow
              label="Instagram"
              ok={connection.instagram}
              icon={<Instagram className="size-4" />}
            />
            <ConnRow
              label="Threads"
              ok={connection.threads}
              icon={<ThreadsIcon className="size-4" />}
            />
            {!connected && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                {platform === 'instagram' ? 'Instagram' : 'Threads'} API chưa
                được kết nối. Bạn vẫn có thể soạn, lưu nháp, copy nội dung và
                đăng thủ công.
              </div>
            )}
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" /> Mở Instagram
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={brand.threadsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" /> Mở Threads
                </a>
              </Button>
              {mediaUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={mediaUrl} download target="_blank" rel="noopener noreferrer">
                    Tải ảnh xuống
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConnRow({
  label,
  ok,
  icon,
}: {
  label: string;
  ok: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2.5">
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {label}
      </span>
      <Badge variant={ok ? 'success' : 'muted'}>
        {ok ? 'Đã kết nối' : 'Chưa kết nối'}
      </Badge>
    </div>
  );
}

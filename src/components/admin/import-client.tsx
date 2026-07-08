'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Download, Loader2, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  csvToRecords,
  validateImportRecords,
  SAMPLE_CSV,
  type ImportRowResult,
} from '@/lib/import/csv';
import { importProducts, type ImportSummary } from '@/actions/import';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function ImportClient() {
  const router = useRouter();
  const [csv, setCsv] = React.useState('');
  const [preview, setPreview] = React.useState<ImportRowResult[] | null>(null);
  const [updateExisting, setUpdateExisting] = React.useState(false);
  const [summary, setSummary] = React.useState<ImportSummary | null>(null);
  const [pending, startTransition] = React.useTransition();

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau-import-san-pham.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setCsv(text);
      buildPreview(text);
    };
    reader.readAsText(file, 'utf-8');
  }

  function buildPreview(text: string) {
    setSummary(null);
    try {
      const { records } = csvToRecords(text);
      if (records.length === 0) {
        toast.error('Không đọc được dòng dữ liệu nào');
        setPreview(null);
        return;
      }
      setPreview(validateImportRecords(records));
    } catch {
      toast.error('CSV không hợp lệ');
      setPreview(null);
    }
  }

  function onImport() {
    if (!csv.trim()) {
      toast.error('Chưa có dữ liệu CSV');
      return;
    }
    startTransition(async () => {
      const result = await importProducts(csv, updateExisting);
      if (result.ok) {
        setSummary(result.data);
        toast.success(
          `Hoàn tất: +${result.data.inserted} mới, ${result.data.updated} cập nhật, ${result.data.failed} lỗi`,
        );
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const validCount = preview?.filter((r) => r.valid).length ?? 0;
  const invalidCount = preview?.filter((r) => !r.valid).length ?? 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Chuẩn bị dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Các cột hỗ trợ: title, platform, original_url, affiliate_url,
            image_url, price, original_price, seller_name, short_description,
            description, category, tags, status. Dòng thiếu{' '}
            <code className="rounded bg-muted px-1">affiliate_url</code> hoặc{' '}
            <code className="rounded bg-muted px-1">title</code> sẽ bị bỏ qua.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadSample}>
              <Download className="size-4" /> Tải file CSV mẫu
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="size-4" /> Chọn file CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={onFile}
                />
              </label>
            </Button>
          </div>
          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            onBlur={() => csv.trim() && buildPreview(csv)}
            rows={6}
            placeholder="Hoặc dán trực tiếp nội dung CSV vào đây..."
            className="font-mono text-xs"
          />
          <Button
            variant="secondary"
            onClick={() => buildPreview(csv)}
            disabled={!csv.trim()}
          >
            Xem trước
          </Button>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              2. Xem trước
              <Badge variant="success">{validCount} hợp lệ</Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">{invalidCount} lỗi</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-80 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Dòng</TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Nền tảng</TableHead>
                    <TableHead>Ghi chú lỗi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((r) => (
                    <TableRow key={r.line}>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.line}
                      </TableCell>
                      <TableCell>
                        {r.valid ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <XCircle className="size-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-sm">
                        {r.raw.title || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.raw.platform || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-destructive">
                        {r.errors.join('; ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={updateExisting}
                onCheckedChange={(v) => setUpdateExisting(Boolean(v))}
              />
              Cập nhật sản phẩm đã tồn tại (trùng affiliate URL)
            </label>

            <Button onClick={onImport} disabled={pending || validCount === 0}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang import...
                </>
              ) : (
                <>
                  <Upload className="size-4" /> Import {validCount} dòng hợp lệ
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Kết quả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Thêm mới', value: summary.inserted },
                { label: 'Cập nhật', value: summary.updated },
                { label: 'Bỏ qua', value: summary.skipped },
                { label: 'Lỗi', value: summary.failed },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border p-3 text-center">
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {summary.rowErrors.length > 0 && (
              <div className="mt-3 space-y-1 text-xs text-destructive">
                {summary.rowErrors.map((e) => (
                  <p key={e.line}>
                    Dòng {e.line}: {e.errors.join('; ')}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

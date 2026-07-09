// =============================================================================
// seed-draft-products.mjs
// Thêm 20 sản phẩm ĐỀ XUẤT ở trạng thái DRAFT (ẩn khỏi site public) vào Supabase.
//
// Nguyên tắc AN TOÀN:
//  - KHÔNG bịa giá / link affiliate / thông số. Giá = null, ảnh = null,
//    affiliate_url = 'AFFILIATE_LINK_REQUIRED' (bạn điền link tracking THẬT của
//    mình rồi mới publish).
//  - status = 'draft' → KHÔNG hiển thị ngoài site, /go chặn draft → an toàn.
//  - Idempotent: upsert theo id (ignoreDuplicates) → chạy lại không tạo trùng.
//  - KHÔNG sửa/xoá dữ liệu cũ. Không đụng danh mục cũ.
//  - Dùng service_role key từ .env.local (KHÔNG hard-code secret).
//
// Chạy:      node scripts/seed-draft-products.mjs
// Rollback:  node scripts/seed-draft-products.mjs --rollback
//            (xoá đúng 20 sản phẩm này theo id prefix 44444444-…, không đụng cái khác)
// =============================================================================
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// --- đọc .env.local ---
const env = {};
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
} catch {
  /* CI: dùng biến môi trường thật */
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const ROLLBACK = process.argv.includes('--rollback');
const AFF_PLACEHOLDER = 'AFFILIATE_LINK_REQUIRED';
const NEED = 'CẦN CẬP NHẬT trước khi publish: link affiliate thật + giá + ảnh + thương hiệu.';

// --- danh mục cần có (chỉ THÊM cái mới, giữ nguyên cái cũ) ---
const categories = [
  { name: 'Chăm sóc da', slug: 'cham-soc-da', description: 'Skincare: rửa mặt, dưỡng ẩm, chống nắng, trị mụn.', status: 'active', sort_order: 4 },
  { name: 'Chăm sóc tóc', slug: 'cham-soc-toc', description: 'Haircare: tạo kiểu, dưỡng phục hồi, massage da đầu.', status: 'active', sort_order: 5 },
  { name: 'Làm đẹp & Chăm sóc cá nhân', slug: 'lam-dep', description: 'Thiết bị làm đẹp, chăm sóc răng miệng, tẩy lông, gương LED.', status: 'active', sort_order: 6 },
];

// --- helper build mô tả HTML (giống format seed cũ) ---
const li = (s) => `<li>${s.replace(/&/g, '&amp;')}</li>`;
function desc({ intro, highlights, audience, note }) {
  let h = `<p>${intro.replace(/&/g, '&amp;')}</p>`;
  h += `<h3>Điểm nổi bật</h3><ul>${highlights.map(li).join('')}</ul>`;
  h += `<h3>Phù hợp cho</h3><ul>${audience.map(li).join('')}</ul>`;
  if (note?.length) h += `<h3>Lưu ý</h3><ul>${note.map(li).join('')}</ul>`;
  h += `<p><em>Giá, thương hiệu và thông số cụ thể sẽ được cập nhật theo sản phẩm thực tế bạn chọn.</em></p>`;
  return h;
}

// --- 20 sản phẩm đề xuất (dạng loại sản phẩm phổ biến, dễ bán, giải quyết vấn đề rõ) ---
// id prefix 44444444-… để rollback an toàn.
const uid = (n) => `44444444-4444-4444-4444-44444440${String(n).padStart(4, '0')}`;
const P = [
  // ===== Chăm sóc da (cham-soc-da) =====
  { cat: 'cham-soc-da', slug: 'may-rua-mat-silicon-song-am', title: 'Máy rửa mặt silicon rung sóng âm',
    short: 'Làm sạch sâu bụi bẩn & bã nhờn, lông silicon mềm không gây kích ứng.', tags: ['#skincare','#mayruamat','#lamsachda'],
    d: { intro: 'Rửa mặt bằng tay khó lấy hết bã nhờn trong lỗ chân lông? Máy rửa mặt silicon rung sóng âm giúp làm sạch sâu nhẹ nhàng mỗi ngày.',
      highlights: ['Lông silicon mềm, kháng khuẩn, không trầy da','Rung sóng âm làm sạch sâu bã nhờn, bụi mịn','Chống nước, sạc lại được'],
      audience: ['Da dầu, da hỗn hợp, người hay trang điểm'], note: ['Không chà mạnh khi da đang mụn viêng nặng'] } },
  { cat: 'cham-soc-da', slug: 'serum-cap-am-hyaluronic', title: 'Serum cấp ẩm Hyaluronic (HA)',
    short: 'Cấp nước tức thì, làm dịu da khô căng — dùng sáng và tối.', tags: ['#serum','#hyaluronic','#capam'],
    d: { intro: 'Da khô, căng, bong tróc do thiếu nước? Serum chứa Hyaluronic Acid giúp cấp và giữ ẩm cho da mềm mịn hơn.',
      highlights: ['HA cấp nước, giữ ẩm nhiều tầng','Kết cấu lỏng nhẹ, thấm nhanh, không nhờn rít','Dùng được cho hầu hết loại da'],
      audience: ['Da khô, da thiếu nước, da ngồi máy lạnh nhiều'], note: ['Thử ở vùng da nhỏ trước nếu da nhạy cảm'] } },
  { cat: 'cham-soc-da', slug: 'kem-chong-nang-mat-spf50', title: 'Kem chống nắng cho da mặt SPF50+ PA++++',
    short: 'Bảo vệ da khỏi tia UV, kết cấu nhẹ không bết dính, không vệt trắng.', tags: ['#chongnang','#spf50','#skincare'],
    d: { intro: 'Chống nắng là bước quan trọng nhất để ngừa lão hoá và thâm nám. Kem chống nắng cho mặt SPF50+ bảo vệ da hằng ngày.',
      highlights: ['Chỉ số cao SPF50+ / PA++++','Kết cấu mỏng nhẹ, không bí da','Làm nền trang điểm mượt'],
      audience: ['Mọi loại da, người đi nắng/ngồi gần cửa sổ nhiều'], note: ['Thoa lại sau 2–3 giờ nếu hoạt động ngoài trời'] } },
  { cat: 'cham-soc-da', slug: 'mieng-dan-mun-hydrocolloid', title: 'Miếng dán mụn hydrocolloid (acne patch)',
    short: 'Hút cồi mụn, che nhân mụn, tránh sờ tay — mụn xẹp nhanh & sạch.', tags: ['#dammun','#acnepatch','#trimun'],
    d: { intro: 'Nặn mụn tay dễ thâm và lây lan? Miếng dán mụn hydrocolloid hút dịch, bảo vệ nốt mụn để lành nhanh hơn.',
      highlights: ['Hút dịch/cồi mụn, giảm sưng','Che chắn, tránh vi khuẩn & tay chạm vào','Mỏng trong, dán ban ngày vẫn kín đáo'],
      audience: ['Da mụn, tuổi teen, người hay lên mụn nội tiết'], note: ['Dùng cho mụn đã gom cồi sẽ hiệu quả hơn'] } },

  // ===== Chăm sóc tóc (cham-soc-toc) =====
  { cat: 'cham-soc-toc', slug: 'luoc-dien-chai-thang-toc', title: 'Lược điện chải thẳng tóc mini',
    short: 'Vuốt là thẳng, làm nóng nhanh — gọn để mang theo, an toàn hơn máy ép.', tags: ['#luocdien','#toc','#lamdep'],
    d: { intro: 'Tóc rối xù buổi sáng mà không có thời gian tạo kiểu? Lược điện chải thẳng giúp vuốt thẳng tóc nhanh chóng.',
      highlights: ['Làm nóng nhanh, chải là thẳng','Răng lược cách nhiệt hạn chế bỏng','Nhỏ gọn, mang theo tiện lợi'],
      audience: ['Người tóc xoăn nhẹ, hay dậy trễ, dân văn phòng'], note: ['Không dùng trên tóc ướt sũng'] } },
  { cat: 'cham-soc-toc', slug: 'may-uon-duoi-toc-cam-tay', title: 'Máy duỗi & uốn tóc cầm tay 2 trong 1',
    short: 'Vừa ép thẳng vừa uốn cụp — một máy nhiều kiểu, chỉnh nhiệt độ.', tags: ['#uonoc','#duoitoc','#taokieu'],
    d: { intro: 'Muốn đổi kiểu tóc mà ngại mua nhiều dụng cụ? Máy 2 trong 1 vừa duỗi thẳng vừa uốn cụp linh hoạt.',
      highlights: ['2 chức năng: duỗi + uốn','Điều chỉnh nhiệt độ theo chất tóc','Bản nhỏ dễ cầm, tạo kiểu tại nhà'],
      audience: ['Người thích đổi kiểu tóc thường xuyên'], note: ['Nên dùng xịt dưỡng nhiệt để bảo vệ tóc'] } },
  { cat: 'cham-soc-toc', slug: 'dau-duong-toc-phuc-hoi', title: 'Dầu dưỡng tóc phục hồi hư tổn (leave-in)',
    short: 'Giảm khô xơ chẻ ngọn, tóc mượt óng — không cần xả lại.', tags: ['#duongtoc','#phuchoitoc','#toclanhmanh'],
    d: { intro: 'Tóc khô xơ, chẻ ngọn sau khi uốn nhuộm? Dầu dưỡng leave-in giúp cấp ẩm và làm mềm mượt sợi tóc.',
      highlights: ['Dưỡng phục hồi, giảm khô xơ chẻ ngọn','Thấm nhanh, không bết','Dùng cho tóc ẩm hoặc khô'],
      audience: ['Tóc uốn/nhuộm/duỗi, tóc hư tổn'], note: ['Thoa từ thân đến ngọn, tránh sát chân tóc nếu tóc dầu'] } },
  { cat: 'cham-soc-toc', slug: 'luoc-goi-dau-massage-da-dau', title: 'Lược gội đầu massage da đầu silicone',
    short: 'Làm sạch gàu & massage thư giãn khi gội — kích thích da đầu.', tags: ['#massagedadau','#goidau','#thugian'],
    d: { intro: 'Gội đầu bằng tay khó làm sạch chân tóc? Lược massage silicone giúp làm sạch sâu và thư giãn da đầu.',
      highlights: ['Gai silicone mềm, massage dễ chịu','Làm sạch gàu, bã nhờn chân tóc','Cầm chắc tay, chống trượt khi ướt'],
      audience: ['Người hay ngứa/gàu, thích thư giãn khi gội'], note: [] } },

  // ===== Làm đẹp & chăm sóc cá nhân (lam-dep) =====
  { cat: 'lam-dep', slug: 'ban-chai-danh-rang-dien-song-am', title: 'Bàn chải đánh răng điện sóng âm',
    short: 'Rung sóng âm làm sạch mảng bám tốt hơn bàn chải thường.', tags: ['#banchaidien','#rangmieng','#chamsoccanhan'],
    d: { intro: 'Đánh răng tay khó sạch kẽ và mảng bám? Bàn chải điện sóng âm làm sạch hiệu quả và nhẹ nhàng với nướu.',
      highlights: ['Rung sóng âm nhiều chế độ chải','Hẹn giờ 2 phút, pin dùng lâu','Đầu chải lông mềm thay thế được'],
      audience: ['Người niềng răng, hay ê buốt, muốn trắng răng'], note: ['Thay đầu chải định kỳ ~3 tháng'] } },
  { cat: 'lam-dep', slug: 'may-tam-nuoc-cam-tay', title: 'Máy tăm nước cầm tay',
    short: 'Tia nước làm sạch kẽ răng, quanh niềng — thay chỉ nha khoa.', tags: ['#tamnuoc','#rangmieng','#vemine'],
    d: { intro: 'Thức ăn kẹt kẽ răng, quanh mắc cài mà tăm/chỉ khó lấy? Máy tăm nước dùng tia nước áp lực làm sạch sâu.',
      highlights: ['Tia nước áp lực nhiều mức','Sạch kẽ răng, quanh niềng, túi nướu','Chống nước, sạc lại được'],
      audience: ['Người niềng răng, hay giắt thức ăn, chăm nướu'], note: ['Bình chứa nhỏ, cần châm nước khi dùng lâu'] } },
  { cat: 'lam-dep', slug: 'may-cao-tay-long-mini-nu', title: 'Máy cạo & tẩy lông mini cho nữ',
    short: 'Cạo lông tay chân/mặt êm, không đau — nhỏ gọn bỏ túi.', tags: ['#taylong','#caolongmini','#lamdep'],
    d: { intro: 'Cần dọn lông nhanh mà ngại wax đau? Máy cạo lông mini cho nữ dùng êm ái, tiện mang theo.',
      highlights: ['Lưỡi cạo êm, hạn chế xước da','Nhỏ gọn, dùng cho tay/chân/mặt','Sạc/pin, dùng khô tiện lợi'],
      audience: ['Nữ muốn dọn lông nhanh tại nhà'], note: ['Không thay thế wax cho hiệu quả lâu dài'] } },
  { cat: 'lam-dep', slug: 'guong-trang-diem-den-led', title: 'Gương trang điểm để bàn có đèn LED',
    short: 'Đèn LED chỉnh sáng, soi rõ để makeup chuẩn màu — có gương phóng đại.', tags: ['#guongled','#trangdiem','#lamdep'],
    d: { intro: 'Trang điểm dưới ánh sáng yếu dễ lệch màu? Gương đèn LED cho ánh sáng đều, soi rõ từng chi tiết.',
      highlights: ['Đèn LED chỉnh độ sáng/nhiệt màu','Có gương phóng đại soi cận','Xoay góc, đặt bàn gọn gàng'],
      audience: ['Người trang điểm, chăm sóc da hằng ngày'], note: [] } },

  // ===== Đồ gia dụng (do-gia-dung) =====
  { cat: 'do-gia-dung', slug: 'ke-nha-tam-dan-tuong', title: 'Kệ để đồ nhà tắm dán tường chống gỉ',
    short: 'Không cần khoan, chịu lực — gọn gàng chai lọ, thoát nước tốt.', tags: ['#kenhatam','#luutru','#dogiadung'],
    d: { intro: 'Nhà tắm bừa bộn chai lọ, không muốn khoan tường? Kệ dán tường chống gỉ giúp sắp xếp gọn gàng.',
      highlights: ['Dán chắc không cần khoan','Chống gỉ, thoát nước nhanh','Lắp nhanh, tháo di dời được'],
      audience: ['Nhà thuê, nhà tắm nhỏ, ai ngại khoan tường'], note: ['Dán trên bề mặt phẳng, sạch để bám chắc'] } },
  { cat: 'do-gia-dung', slug: 'den-led-cam-bien-chuyen-dong', title: 'Đèn LED cảm biến chuyển động dán tường',
    short: 'Tự sáng khi có người, tắt khi vắng — tiện cầu thang, tủ, hành lang.', tags: ['#dencambien','#denled','#tienich'],
    d: { intro: 'Dò dẫm bật đèn ban đêm bất tiện? Đèn LED cảm biến tự sáng khi có chuyển động, tiết kiệm điện.',
      highlights: ['Cảm biến chuyển động tự bật/tắt','Dán nam châm, không cần đi dây','Sạc/pin, ánh sáng dịu'],
      audience: ['Nhà có trẻ/người già, cầu thang, tủ quần áo tối'], note: ['Phạm vi cảm biến giới hạn, gắn đúng hướng đi lại'] } },
  { cat: 'do-gia-dung', slug: 'hop-bao-quan-thuc-pham-tu-lanh', title: 'Bộ hộp bảo quản thực phẩm tủ lạnh',
    short: 'Giữ đồ tươi lâu, xếp chồng gọn tủ lạnh — nắp kín chống tràn.', tags: ['#hopthucpham','#bepnho','#dogiadung'],
    d: { intro: 'Tủ lạnh lộn xộn, thức ăn nhanh héo? Bộ hộp bảo quản giúp giữ tươi và sắp xếp khoa học.',
      highlights: ['Nắp kín giữ tươi, chống ám mùi','Xếp chồng tiết kiệm chỗ','Dùng được lò vi sóng/tủ đông (tuỳ loại)'],
      audience: ['Người nấu ăn, meal-prep, nhà bếp nhỏ'], note: ['Kiểm tra chất liệu chịu nhiệt trước khi quay lò'] } },
  { cat: 'do-gia-dung', slug: 'tham-bep-chong-dau-chong-truot', title: 'Thảm bếp chống dầu chống trượt',
    short: 'Chống dầu mỡ & trượt ngã, lau là sạch — êm chân khi đứng bếp lâu.', tags: ['#thambep','#chongtruot','#dogiadung'],
    d: { intro: 'Sàn bếp trơn dầu mỡ dễ té? Thảm bếp chống dầu chống trượt vừa an toàn vừa êm chân.',
      highlights: ['Bề mặt chống trượt, chống dầu','Lau nhanh sạch, không thấm','Êm chân khi nấu nướng lâu'],
      audience: ['Nhà bếp, người đứng nấu nhiều, nhà có người già'], note: [] } },

  // ===== Phụ kiện công nghệ (cong-nghe) =====
  { cat: 'cong-nghe', slug: 'cap-sac-nhanh-3-in-1', title: 'Cáp sạc nhanh đa cổng 3 trong 1',
    short: 'Một cáp sạc Type-C/Lightning/Micro — gọn cho mọi thiết bị.', tags: ['#capsac','#sacnhanh','#phukien'],
    d: { intro: 'Mang nhiều cáp cho nhiều máy thật lỉnh kỉnh? Cáp 3 trong 1 sạc được hầu hết thiết bị phổ biến.',
      highlights: ['3 đầu: Type-C, Lightning, Micro-USB','Hỗ trợ sạc nhanh (tuỳ thiết bị)','Dây bền, gọn khi mang theo'],
      audience: ['Người dùng nhiều thiết bị, hay đi lại'], note: ['Tốc độ sạc phụ thuộc củ sạc & thiết bị'] } },
  { cat: 'cong-nghe', slug: 'quat-mini-cam-tay-sac-usb', title: 'Quạt mini cầm tay sạc USB',
    short: 'Mát nhanh, pin lâu, gấp gọn — cứu tinh ngày hè khi ra đường.', tags: ['#quatmini','#quatcamtay','#mua he'],
    d: { intro: 'Ra đường mùa hè nóng bức? Quạt mini cầm tay sạc USB làm mát tức thì, bỏ túi/balo gọn.',
      highlights: ['Nhiều mức gió, chạy êm','Pin sạc dùng nhiều giờ','Gấp gọn, có thể để bàn'],
      audience: ['Người đi làm/đi học, đi du lịch, mẹ bỉm'], note: [] } },
  { cat: 'cong-nghe', slug: 'den-led-kep-man-hinh', title: 'Đèn LED kẹp màn hình chống chói (screen bar)',
    short: 'Chiếu sáng bàn làm việc, không hắt bóng lên màn — đỡ mỏi mắt.', tags: ['#denman hinh','#screenbar','#lamviec'],
    d: { intro: 'Làm việc buổi tối bị mỏi mắt vì thiếu sáng/chói màn? Đèn kẹp màn hình chiếu sáng bàn mà không hắt vào màn.',
      highlights: ['Ánh sáng không chói, không hắt bóng màn','Chỉnh độ sáng & nhiệt màu','Kẹp gọn, không chiếm mặt bàn'],
      audience: ['Dân văn phòng, học sinh, người làm việc khuya'], note: [] } },
  { cat: 'cong-nghe', slug: 'gia-do-dien-thoai-de-ban', title: 'Giá đỡ điện thoại để bàn gấp gọn',
    short: 'Chỉnh góc rảnh tay xem video/họp online — nhôm chắc, gấp gọn.', tags: ['#giadodienthoai','#phukien','#lamviec'],
    d: { intro: 'Cầm điện thoại lâu mỏi tay khi xem/họp? Giá đỡ để bàn giúp rảnh tay và chỉnh góc thoải mái.',
      highlights: ['Chỉnh nhiều góc nhìn','Chất liệu chắc chắn, chống trượt','Gấp gọn mang theo'],
      audience: ['Người họp online, xem video, nấu ăn theo công thức'], note: [] } },
];

async function main() {
  // test kết nối
  const probe = await sb.from('products').select('id').limit(1);
  if (probe.error) { console.error('❌ Lỗi kết nối/bảng products:', probe.error.message); process.exit(1); }

  const ids = P.map((_, i) => uid(i + 1));

  if (ROLLBACK) {
    // Xoá liên kết danh mục trước (FK), rồi xoá sản phẩm — CHỈ 20 id của seed này.
    await sb.from('product_categories').delete().in('product_id', ids);
    const { error, count } = await sb.from('products').delete({ count: 'exact' }).in('id', ids);
    if (error) { console.error('❌ Rollback lỗi:', error.message); process.exit(1); }
    console.log(`↩️  Đã xoá ${count ?? 0} sản phẩm draft (id 44444444-…). Danh mục mới KHÔNG bị xoá (an toàn).`);
    return;
  }

  // 1) upsert danh mục mới (giữ nguyên cái cũ)
  {
    const { error } = await sb.from('categories').upsert(categories, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { console.error('❌ Lỗi upsert categories:', error.message); process.exit(1); }
  }
  const wantCats = ['cham-soc-da', 'cham-soc-toc', 'lam-dep', 'do-gia-dung', 'cong-nghe'];
  const catRes = await sb.from('categories').select('id,slug').in('slug', wantCats);
  if (catRes.error) { console.error(catRes.error.message); process.exit(1); }
  const catId = Object.fromEntries(catRes.data.map((c) => [c.slug, c.id]));
  const missing = wantCats.filter((s) => !catId[s]);
  if (missing.length) { console.error('❌ Thiếu danh mục:', missing.join(', ')); process.exit(1); }

  // 2) build rows (DRAFT + placeholder)
  const rows = P.map((p, i) => ({
    id: uid(i + 1),
    title: p.title,
    slug: p.slug,
    short_description: p.short,
    description: desc(p.d),
    platform: 'shopee',
    original_url: null,
    affiliate_url: AFF_PLACEHOLDER,
    image_url: null,
    price: null,
    original_price: null,
    currency: 'VND',
    seller_name: null,
    commission_note: NEED,
    copywriting: `${p.title}\n${p.short}\nMua ngay 👇 (DÁN LINK AFFILIATE CỦA BẠN)\n${p.tags.join(' ')}\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)`,
    cta_text: 'Xem ưu đãi',
    status: 'draft',
    is_featured: false,
    show_on_bio: false,
    bio_order: 0,
    published_at: null,
  }));

  // 3) upsert sản phẩm (idempotent theo id)
  {
    const { error } = await sb.from('products').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) { console.error('❌ Lỗi upsert products:', error.message); process.exit(1); }
  }

  // 4) gắn danh mục
  const links = P.map((p, i) => ({ product_id: uid(i + 1), category_id: catId[p.cat] }));
  {
    const { error } = await sb.from('product_categories').upsert(links, { onConflict: 'product_id,category_id', ignoreDuplicates: true });
    if (error) { console.error('❌ Lỗi gắn danh mục:', error.message); process.exit(1); }
  }

  // 5) xác minh
  const check = await sb.from('products').select('slug,status').in('id', ids);
  const drafts = (check.data ?? []).filter((r) => r.status === 'draft').length;
  const byCat = {};
  for (const p of P) byCat[p.cat] = (byCat[p.cat] ?? 0) + 1;
  console.log(`\n✅ Đã seed ${check.data?.length ?? 0}/20 sản phẩm (draft: ${drafts}).`);
  console.log('   Phân bổ danh mục:', Object.entries(byCat).map(([k, v]) => `${k}=${v}`).join(', '));
  const pub = await sb.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null);
  console.log(`📦 Sản phẩm PUBLISHED (hiện ra site) vẫn giữ nguyên: ${pub.count ?? '?'} (draft không ảnh hưởng).`);
  console.log('\nBước tiếp theo (thủ công): mở /admin → Sản phẩm (lọc Bản nháp) → điền link affiliate + giá + ảnh → chuyển Publish.');
}

main();

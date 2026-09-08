# KHÁM PHÁ SẢN PHẨM MAJORMATCH CLIENT

**Mục:** 3.1 — CS2028, Chuyên đề 4: AI Product Development: End to End.  
**Đơn vị:** VKU; giảng viên theo đề bài: ThS. Lê Thành Công.  
**Phiên bản:** 1.0 — 08/09/2026. **Trạng thái:** đề xuất sản phẩm dựa trên baseline, chưa nghiệm thu triển khai.  
**Baseline:** [PRD 1.0.0, Approved ngày 05/09/2026](PRD.md), mục 1–5 và 7. PRD được tham chiếu cho mục 3.2, không viết lại.

## 1. Tóm tắt điều hành và định nghĩa vấn đề

MajorMatch hỗ trợ học sinh và sinh viên chuyển từ câu hỏi “Tôi nên chọn ngành nào?” sang một quyết định có căn cứ: so sánh ba hướng học, nhìn thấy khoảng cách kỹ năng và thử một kế hoạch bổ sung môn học. Client cung cấp khảo sát sở thích, tiếp nhận bảng điểm/CV PDF, biểu đồ radar, checklist mô phỏng và hội thoại cố vấn. Trích xuất học thuật, đối sánh và suy luận AI thuộc backend riêng theo PRD.

Vấn đề sản phẩm là sự phân mảnh giữa sở thích, minh chứng học tập và điều kiện chương trình đào tạo. Chọn ngành thiếu thông tin có thể làm tăng chi phí học lại, trì hoãn tốt nghiệp và lo lắng. Tuy nhiên, không được đồng nhất mọi trường hợp thôi học với chọn sai ngành: tài chính, sức khỏe, kết quả học tập và hoàn cảnh gia đình cũng có thể liên quan. MajorMatch chưa có nghiên cứu chứng minh làm giảm thôi học hoặc tăng khả năng có việc làm.

### 1.1. Bối cảnh thống kê và giới hạn bằng chứng

| Chủ đề | Bằng chứng kiểm tra ngày 08/09/2026 | Cách sử dụng trong discovery |
|---|---|---|
| Thôi học đại học | Báo cáo công khai năm học 2024–2025 của Đại học Lâm nghiệp, ký 23/06/2025, mục 5.1 trang 18, công bố chỉ số năm 2024: thôi học 1,56%; thôi học năm đầu 3,71% | Minh họa ở một cơ sở; không phải tỷ lệ toàn quốc, không suy ra nguyên nhân chọn sai ngành |
| Chuyển ngành/chuyển trường | Chưa xác minh được chuỗi số liệu quốc gia có mẫu số, định nghĩa và kỳ quan sát phù hợp | Không đưa một tỷ lệ quốc gia vào business case; phân biệt ý định chuyển với hồ sơ chuyển đã hoàn tất |
| Lo lắng và nhu cầu hỗ trợ | Nghiên cứu của Luu và cộng sự (2026) về sinh viên khối kinh tế dùng khảo sát 701 người và phỏng vấn; abstract mô tả nhu cầu hỗ trợ tâm lý và học tập | Tín hiệu nhu cầu hỗ trợ; không đại diện riêng cho VKU hoặc sinh viên CNTT, không suy ra tỷ lệ lo âu lâm sàng |
| Sở thích nghề nghiệp | O*NET Interest Profiler mô tả sáu nhóm RIASEC, bản Mini-IP 30 câu và Short Form 60 câu | Bộ 10 câu CNTT của MajorMatch là khảo sát rút gọn do dự án xây dựng, chưa có bằng chứng giá trị đo lường tương đương |

Nguồn: [Đại học Lâm nghiệp — báo cáo công khai, trang 18](https://vnuf.edu.vn/wp-content/uploads/2026/03/Bao-cao-cong-khai-nam-hoc-2024-2025.pdf.pdf); [Luu và cộng sự — abstract và thông tin xuất bản trên RePEc](https://ideas.repec.org/a/gam/jijerp/v23y2026i2p232-d1862695.html); [O*NET — Interest Profiler](https://www.onetcenter.org/IP.html). Toàn văn nghiên cứu tâm lý tại nhà xuất bản trả lỗi 429 khi truy cập, nên chỉ sử dụng thông tin abstract được lập chỉ mục.

### 1.2. Giả thuyết sản phẩm

1. Khi nhìn thấy môn học liên quan đến kỹ năng còn thiếu, người học dễ chọn hành động tiếp theo hơn so với chỉ nhận nhãn tính cách.
2. Khi tự mô phỏng hoàn thành môn học, người học hiểu sự khác nhau giữa năng lực có minh chứng và mục tiêu dự kiến.
3. Khi biết nơi xử lý bảng điểm và có thể dùng khảo sát mà không tải PDF, người học có nhiều quyền lựa chọn hơn.
4. Cố vấn có thể dùng báo cáo làm điểm bắt đầu hội thoại nếu biết nguồn dữ liệu, phiên bản chương trình và giới hạn chỉ số.

Đây là giả thuyết cần kiểm chứng, không phải kết quả phỏng vấn đã thực hiện. Phạm vi khả thi ban đầu là các hướng CNTT có dữ liệu chương trình được rà soát; không quảng bá bộ câu hỏi CNTT hiện tại như công cụ bao quát mọi ngành kinh tế, y tế hoặc nghệ thuật.

## 2. Ba chân dung người dùng chuyên sâu

Các persona sau là **proto-persona tổng hợp**, dùng thiết kế và tuyển người tham gia nghiên cứu; tên và tình huống không đại diện hồ sơ cá nhân thật.

### Persona A — Nguyễn Văn An: sinh viên CNTT năm hai

| Thuộc tính | Mô tả |
|---|---|
| Nhân khẩu học | 20 tuổi, học năm hai tại Đà Nẵng; đã học lập trình, toán, cơ sở dữ liệu; dùng laptop và điện thoại Android |
| Bối cảnh quyết định | Chuẩn bị chọn học phần và hướng thực tập giữa phần mềm, dữ liệu/AI và hạ tầng |
| Tâm lý | Thích bằng chứng định lượng, dễ so sánh với bạn bè; lo một điểm thấp quyết định toàn bộ tương lai |
| Khó khăn | Không biết kỹ năng nào đã có minh chứng; lời khuyên trên mạng quá rộng; chưa hiểu môn tiên quyết; ngại đưa bảng điểm lên dịch vụ AI công cộng |
| Động lực | Có kế hoạch học kỳ vừa sức và một đồ án đủ cụ thể để bắt đầu trong tuần |
| Công việc cần hoàn thành | Khi đăng ký học, muốn đối chiếu hồ sơ với từng hướng để chọn môn bổ sung có lý do |
| Điều kiện thành công | Giải thích được hai khoảng cách kỹ năng; chọn một môn và một đồ án; biết readiness là mô phỏng, không phải xác suất tuyển dụng |
| Rào cản | PDF scan không trích được text; mạng ký túc xá yếu; chỉ số phần trăm thiếu giải thích |

**Hành trình cảm xúc:** bối rối khi xem mô tả ngành → thận trọng khi tải PDF → nhẹ nhõm khi kiểm tra preview → có thể thất vọng khi thấy Missing Skills → chủ động khi thử checklist → tự tin có điều kiện khi trao đổi với cố vấn. Giao diện phải diễn đạt “chưa có minh chứng” thay vì “không có năng lực”.

### Persona B — Lê Thị Bình: học sinh lớp 12

| Thuộc tính | Mô tả |
|---|---|
| Nhân khẩu học | 17–18 tuổi, học lớp 12 tại miền Trung; thao tác chủ yếu trên màn hình 375px; gia đình tham gia quyết định ngành |
| Bối cảnh quyết định | Quan tâm công nghệ nhưng chưa phân biệt AI, phần mềm và an toàn thông tin; chưa có bảng điểm đại học |
| Tâm lý | Muốn khám phá nhanh, nhạy cảm với nhận xét “không phù hợp”; chịu áp lực chọn ngành ổn định |
| Khó khăn | Nội dung tuyển sinh thiên về quảng bá; thiếu trải nghiệm nghề; không hiểu thuật ngữ hoặc hệ điểm đại học |
| Động lực | Có ba hướng để tìm hiểu và một hoạt động trải nghiệm trước khi chốt nguyện vọng |
| Công việc cần hoàn thành | Dùng sở thích và career tags để khám phá hướng CNTT mà không phải giả lập thành tích đại học |
| Điều kiện thành công | Hoàn thành 10 câu bằng cảm ứng/bàn phím; hiểu lý do gợi ý và giới hạn dữ liệu; không bị yêu cầu PDF bắt buộc |
| Rào cản | Slider khó chạm, nhãn dài, coi thứ hạng là kết luận chắc chắn; thẻ nghề CNTT không bao phủ mong muốn ngoài lĩnh vực |

**Hành trình cảm xúc:** tò mò → dè dặt trước câu hỏi chuyên môn → được hỗ trợ bằng giải thích ngắn → hào hứng khám phá ba hướng → cân nhắc cùng gia đình/cố vấn. Kết quả thiếu minh chứng phải hiển thị “định hướng theo sở thích”, không tự gán Python, SQL hoặc GPA mẫu.

### Persona C — Trần Minh Hà: cố vấn học tập

| Thuộc tính | Mô tả |
|---|---|
| Nhân khẩu học | Persona giả định 38 tuổi, giảng viên kiêm cố vấn, có nhiều phiên tư vấn ngắn trong tuần |
| Bối cảnh quyết định | Sinh viên đề nghị đổi hướng hoặc chọn môn; cần kiểm tra thông tin trước khi tư vấn |
| Tâm lý | Ưu tiên độ tin cậy, khả năng truy nguồn và trách nhiệm học thuật hơn hiệu ứng AI |
| Khó khăn | Mất thời gian đọc bảng điểm; khó đối chiếu thủ công nhiều hướng; mô hình AI có thể bịa môn hoặc bỏ tiên quyết |
| Động lực | Tập trung buổi gặp vào lựa chọn và giới hạn thực tế; giúp sinh viên tự lập kế hoạch |
| Công việc cần hoàn thành | Xem báo cáo được người học chủ động chia sẻ, kiểm tra nguồn chương trình và các môn còn thiếu |
| Điều kiện thành công | Phân biệt dữ liệu thật/mẫu, gốc/mô phỏng; kiểm tra được mã môn, kỳ chương trình và điều kiện tiên quyết |
| Rào cản | Báo cáo không có provenance; chưa có quyền truy cập hay hệ thống quản lý nhiều sinh viên |

**Hành trình cảm xúc:** hoài nghi → kiểm tra nguồn và số liệu → chấp nhận dùng như tài liệu hỗ trợ → trao đổi với sinh viên → xác nhận kế hoạch qua quy trình trường. MVP hỗ trợ cùng xem trên thiết bị người học hoặc tệp xuất; chưa bao gồm dashboard cố vấn, phân quyền tổ chức hoặc truy cập hồ sơ sinh viên khác.

## 3. Lean Canvas

| Khối | Nội dung MajorMatch Client |
|---|---|
| Problem | Hồ sơ, sở thích và chương trình rời rạc; khó chuyển tư vấn thành hành động; lo ngại chia sẻ bảng điểm |
| Customer Segments | Chính: sinh viên CNTT năm 1–3; kế tiếp: học sinh lớp 12 quan tâm CNTT; người hỗ trợ: cố vấn học tập |
| Unique Value Proposition | “Hiểu khoảng cách kỹ năng, thử lộ trình học và trao đổi bằng minh chứng trong cùng một không gian.” |
| Solution | Web 2.0 Dynamic Simulation: radar hai lớp, đổi ngành, checklist và hội thoại theo ngữ cảnh; mục tiêu Zero-SaaS PII Leakage được giới hạn là không gửi hồ sơ vào API AI SaaS bên ngoài |
| Channels | Buổi hướng nghiệp VKU, lớp học phần, câu lạc bộ CNTT, phiên tư vấn có người hướng dẫn; thử nghiệm tự nguyện bằng hồ sơ tổng hợp |
| Revenue | Học phần: không thu phí; giả thuyết sau học phần: trường chi trả triển khai và hỗ trợ nội bộ, chưa có doanh thu hoặc định giá được xác nhận |
| Cost Structure | Công sức ba thành viên; GPU/điện/mạng nội bộ; bảo trì dữ liệu chương trình; hosting, domain, bảo mật và hỗ trợ. AI local không đồng nghĩa tổng chi phí bằng 0 |
| Key Metrics | Activation, Time-to-Milestone, D7 retention, hiểu đúng chỉ số mô phỏng, tỷ lệ phát hiện dữ liệu mẫu, tỷ lệ lỗi tích hợp |
| Unfair Advantage | Khả năng tiếp cận cố vấn và dữ liệu chương trình VKU là lợi thế tiềm năng cần có sự hợp tác; pipeline private có thể tăng tin cậy nhưng không phải lợi thế khó sao chép đã được chứng minh |

**Biên riêng tư:** Vercel phục vụ frontend; đường dữ liệu dự kiến là trình duyệt → Cloudflare Tunnel/gateway → HPC. Cloudflare là bên trung chuyển, nên “không dùng AI SaaS” không có nghĩa dữ liệu không đi qua hạ tầng bên thứ ba. Không tuyên bố khử PII 100% chỉ từ spinner hoặc kiểm tra phần mở rộng tệp. Cần kiểm tra network, cấu hình logging, nơi kết thúc TLS và chính sách lưu dữ liệu trước khi công bố cam kết vận hành.

### 3.1. Định nghĩa đo lường

| Chỉ số | Công thức/phạm vi | Ngưỡng giả thuyết cho pilot |
|---|---|---|
| Activation | Số phiên người thật xem kết quả hợp lệ, chọn ngành và mở roadmap / số phiên bắt đầu ingestion có đồng ý tham gia; loại phiên demo | ≥70% trong 20 phiên thử có hướng dẫn |
| Time-to-Milestone | Thời gian từ bắt đầu ingestion đến lần lưu/tích mục kế hoạch đầu tiên; báo cáo median và p90, không coi là đã hoàn thành môn ngoài đời | Median ≤5 phút; báo cáo riêng thời gian backend |
| D7 retention | Số người đã activation quay lại ngày 7 ±1 và xem/cập nhật kế hoạch / số người activation đủ thời gian quan sát | ≥30%; nếu không đồng ý định danh cục bộ thì không đưa vào mẫu số |
| Hiểu chỉ số | Số người giải thích đúng “mô phỏng, không bảo đảm việc làm” / số người trả lời câu kiểm tra cuối phiên | ≥90% |
| Data provenance | Số người nhận ra banner demo khi xem fixture / số người được thử tình huống demo | 100% |

Các ngưỡng trên là tiêu chí thử nghiệm đề xuất, chưa phải KPI thực đo. Chỉ thu event tối thiểu bằng mã phiên ngẫu nhiên với sự đồng ý; không thu PDF, tên, GPA hoặc nội dung chat trong analytics. Số liệu pilot nhỏ được báo cáo kèm tử số/mẫu số, không suy rộng toàn quốc.

## 4. Value Proposition Canvas

| Persona / Customer job | Pain | Pain reliever | Gain | Gain creator / bằng chứng nghiệm thu |
|---|---|---|---|---|
| An: chọn hướng học | Không thấy môn học liên quan nghề | SkillBreakdown gắn nguồn minh chứng và benchmark | Biết cần học gì tiếp | Roadmap có mã môn, lý do và tiên quyết; US-ANA-03, US-ADV-01 |
| An: thử kế hoạch | Sợ thay đổi lựa chọn gây mất dữ liệu | Tách hồ sơ gốc và trạng thái mô phỏng theo ngành | So sánh tác động rõ ràng | Tích/bỏ tích khôi phục chính xác; US-ADV-02 |
| Bình: khám phá | Không có CV hoặc bảng điểm đại học | Luồng khảo sát độc lập với PDF | Thấy lựa chọn phù hợp để tìm hiểu | Top 3 có nhãn nguồn sở thích; US-ING-03, US-ANA-02 |
| Bình: thao tác điện thoại | Nhãn dài, khó chạm radar | Bố cục một cột, bảng số liệu thay thế, nút chạm trục | Tự sử dụng được | Kiểm tra 375px và bàn phím; US-ANA-04 |
| Hà: tư vấn | AI không giải thích nguồn hoặc bịa môn | Provenance chương trình, khóa tiên quyết và course ID hợp lệ | Buổi gặp có trọng tâm | Chat có ngữ cảnh và tệp kế hoạch; US-ADV-04, US-ADV-06 |
| Cả ba: tin cậy dữ liệu | Nhầm fixture thành phân tích thật | Banner demo xuyên suốt và chủ động chọn demo | Hiểu giới hạn kết quả | Lỗi 4xx không tự đổi thành success giả; US-ING-05 |

## 5. Ma trận cạnh tranh: bảy chiều

Đây là so sánh **mẫu giải pháp theo công việc sử dụng**, không phải benchmark thử nghiệm đối thủ. Đề bài nêu bảy chiều nhưng liệt kê sáu; chiều thứ bảy được bổ sung là khả năng giải thích/truy nguồn.

| Chiều | MajorMatch — mục tiêu | ChatGPT/Claude dùng chung | Web form MBTI/RIASEC truyền thống | Trung tâm tư vấn đại học |
|---|---|---|---|---|
| 1. Riêng tư PII | Xử lý AI tại HPC, không gọi AI SaaS; còn phụ thuộc gateway/logging | Dữ liệu xử lý bởi nhà cung cấp; quyền dùng dữ liệu tùy sản phẩm và cài đặt | Tùy đơn vị vận hành và nơi lưu câu trả lời | Theo quy trình trường và quyền tiếp cận hồ sơ |
| 2. Bám chương trình trường | Benchmark có phiên bản và nguồn là yêu cầu bắt buộc, chưa nghiệm thu dữ liệu | Có thể dùng tài liệu được cung cấp; không mặc định có chương trình hiện hành | Thường trả nhóm sở thích; đối chiếu học phần là phần tích hợp bổ sung | Có thể có chuyên môn và quyền truy cập chương trình, tùy đơn vị |
| 3. Vector gap định lượng | Radar năng lực sáu trục, phân loại kỹ năng | Có thể phân tích theo prompt; cần chuẩn hóa thang đo và kiểm chứng | Điểm sở thích không tự là vector năng lực | Thường diễn giải qua tư vấn, có thể sử dụng công cụ riêng |
| 4. State tương tác Web 2.0 | Checklist cập nhật cục bộ, snapshot theo ngành | Hội thoại có tương tác; dashboard checklist cần thiết kế ứng dụng riêng | Form có trạng thái câu trả lời; mô phỏng roadmap tùy sản phẩm | Tương tác trực tiếp; khả năng mô phỏng số tùy hệ thống |
| 5. Độ trễ | Mục tiêu state <50ms; AI phụ thuộc GPU/mạng, chưa đo | Phụ thuộc dịch vụ, model và tải; không đưa số so sánh chưa đo | Tính điểm local có thể nhanh; phụ thuộc triển khai | Phụ thuộc lịch hẹn và năng lực phục vụ |
| 6. Chi phí | Không thu phí trong học phần; có chi phí phần cứng và bảo trì | Có gói và điều kiện sử dụng khác nhau; không cố định giá trong tài liệu | Có thể miễn phí hoặc thu phí báo cáo | Có thể nằm trong dịch vụ sinh viên; tùy trường |
| 7. Giải thích/truy nguồn | Mục tiêu hiển thị nguồn benchmark và giới hạn mô phỏng | Có thể cung cấp lý giải/nguồn, vẫn cần đối chiếu | Tùy tài liệu thang đo và cách giải thích | Cố vấn giải thích và chịu trách nhiệm theo quy trình trường |

Quyền kiểm soát dữ liệu AI công cộng tham chiếu [OpenAI — cách dùng dữ liệu cải thiện mô hình](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/) và [Anthropic — dữ liệu có dùng để huấn luyện không](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training), truy cập 08/09/2026. Không suy diễn rằng mọi hội thoại đều dùng để huấn luyện hoặc mọi công cụ đối thủ đều thiếu riêng tư.

## 6. Kế hoạch kiểm chứng discovery và quyết định phạm vi

Pilot đề xuất gồm 8 sinh viên, 8 học sinh quan tâm CNTT và 4 cố vấn; tuyển tự nguyện, dùng dữ liệu tổng hợp trước. Phỏng vấn 20 phút về lần ra quyết định gần nhất, cho thao tác 15 phút, rồi yêu cầu giải thích kết quả bằng lời của người dùng. Hỏi về hành vi đã xảy ra, tránh câu dẫn “AI có hữu ích không?”. Với người chưa thành niên, tổ chức qua nhà trường và quy trình đồng ý phù hợp của đơn vị.

Ba bài thử: An tải fixture PDF và chọn hai hướng; Bình hoàn tất khảo sát không PDF; Hà kiểm tra một roadmap có tiên quyết bị thiếu và báo cáo demo. Ghi hoàn thành tác vụ, điểm gây nhầm, số lần cần trợ giúp và hiểu đúng provenance. Văn Hoàng tổng hợp ingestion; Ánh Vy tổng hợp khả năng đọc radar; Long Nhật kiểm tra kế hoạch/chat và quyết định ưu tiên cùng nhóm.

**MVP:** ba module trên, một không gian người học, demo minh bạch và xuất kế hoạch cục bộ. **Ngoài phạm vi:** chẩn đoán tâm lý, cam kết trúng tuyển/việc làm, tự phê duyệt chuyển ngành, LMS/SIS đồng bộ và dashboard đa sinh viên. Ưu tiên sửa hợp đồng API và tính đúng dữ liệu trước khi mở rộng ngành.

## 7. Căn cứ mã nguồn và mức tin cậy

Checkout được đọc: repository cha tại commit `2a33ec54721c8138d78399531e9040b720d942d1`; `client/` là subtree theo quy tắc đồng bộ, không phải commit riêng của remote client. Truy cập web repository đích không trả nội dung, nên kết luận code chỉ áp dụng checkout cục bộ.

Đã đọc [FileDropzone](../../src/components/upload/FileDropzone.tsx), [RiasecSurvey](../../src/components/upload/RiasecSurvey.tsx), [survey data](../../src/types/survey.ts), [API service](../../src/services/api.ts), [store](../../src/stores/useProfileStore.ts), các component analytics/advisor và backend routes ở workspace cha. Bộ câu hỏi, sáu career tags và dữ liệu mẫu hiện thiên về CNTT. Chưa có dữ liệu phỏng vấn, benchmark hiệu năng hoặc chứng nhận bảo mật. Các khoảng cách triển khai được phân tích trong [REQUIREMENTS_ANALYSIS](REQUIREMENTS_ANALYSIS.md).

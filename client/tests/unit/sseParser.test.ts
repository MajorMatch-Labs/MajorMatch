/**
 * Unit Test Suite: SSE Stream Line Buffer Parser & Token Extraction
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Long Nhat <torikun2005@gmail.com> - Tech Lead & Advisor Module
 */

import { SseLineBufferParser } from '../../src/modules/advisor/utils/sseParser';

describe('Advisor Module - SSE Stream Parser', () => {
  let parser: SseLineBufferParser;

  beforeEach(() => {
    parser = new SseLineBufferParser();
  });

  it('giải mã chính xác một khối sự kiện SSE hoàn chỉnh đơn lẻ', () => {
    const rawChunk = 'event: message\ndata: {"token": "Xin", "done": false}\n\n';
    const events = parser.feed(rawChunk);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('message');
    expect(events[0].data).toBe('{"token": "Xin", "done": false}');

    const payload = SseLineBufferParser.extractTokenPayload(events[0]);
    expect(payload?.token).toBe('Xin');
    expect(payload?.done).toBe(false);
  });

  it('xử lý ghép luồng chuẩn xác khi khối sự kiện bị cắt đôi qua 2 chunks mạng', () => {
    const chunk1 = 'event: message\ndata: {"token": "chào ';
    const chunk2 = 'bạn!", "done": false}\n\n';

    // Chunk 1 chưa kết thúc bằng \n\n nên chưa sinh event
    const events1 = parser.feed(chunk1);
    expect(events1).toHaveLength(0);

    // Chunk 2 nạp phần còn lại và kết thúc block
    const events2 = parser.feed(chunk2);
    expect(events2).toHaveLength(1);

    const payload = SseLineBufferParser.extractTokenPayload(events2[0]);
    expect(payload?.token).toBe('chào bạn!');
    expect(payload?.done).toBe(false);
  });

  it('bỏ qua các dòng comment heartbeat ping (:keepalive)', () => {
    const chunkWithPing = ':keepalive\n\nevent: message\ndata: {"token": "AI", "done": false}\n\n';
    const events = parser.feed(chunkWithPing);

    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('{"token": "AI", "done": false}');
  });

  it('nhận diện chính xác cờ kết thúc [DONE]', () => {
    const doneChunk = 'data: [DONE]\n\n';
    const events = parser.feed(doneChunk);

    expect(events).toHaveLength(1);
    const payload = SseLineBufferParser.extractTokenPayload(events[0]);
    expect(payload?.done).toBe(true);
  });
});

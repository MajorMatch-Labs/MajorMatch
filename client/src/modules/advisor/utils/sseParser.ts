/**
 * Incremental Line Buffer Parser for Server-Sent Events (SSE)
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Long Nhat <torikun2005@gmail.com> - Tech Lead & Advisor Module
 */

import { SseRawEvent, SseTokenPayload } from '../types/sseTypes';

export class SseLineBufferParser {
  private buffer: string = '';

  /**
   * Nap mot chunk van ban moi vao bo dem va tra ve danh sach cac event hoan chinh
   */
  public feed(chunk: string): SseRawEvent[] {
    this.buffer += chunk;
    const events: SseRawEvent[] = [];

    // Cac event SSE duoc ngan cach boi hai dau xuong dong lien tiep (\n\n hoac \r\n\r\n)
    const blocks = this.buffer.split(/\r?\n\r?\n/);

    // Phan tu cuoi cung chua chac da hoan chinh, giu lai trong bo dem
    this.buffer = blocks.pop() || '';

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      const parsedEvent = this.parseEventBlock(block);
      if (parsedEvent) {
        events.push(parsedEvent);
      }
    }

    return events;
  }

  /**
   * Giai ma mot khoi event text don le thanh SseRawEvent
   */
  private parseEventBlock(block: string): SseRawEvent | null {
    let eventName = 'message';
    const dataLines: string[] = [];
    let id: string | undefined;

    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.startsWith(':')) {
        // Bo qua dong trong hoac SSE comment/heartbeat ping (:keepalive)
        continue;
      }

      const colonIndex = line.indexOf(':');
      let field: string;
      let value: string;

      if (colonIndex === -1) {
        field = line;
        value = '';
      } else {
        field = line.slice(0, colonIndex).trim();
        value = line.slice(colonIndex + 1);
        if (value.startsWith(' ')) {
          value = value.slice(1);
        }
      }

      if (field === 'event') {
        eventName = value || 'message';
      } else if (field === 'data') {
        dataLines.push(value);
      } else if (field === 'id') {
        id = value;
      }
    }

    if (dataLines.length === 0) {
      return null;
    }

    return {
      event: eventName,
      data: dataLines.join('\n'),
      id,
    };
  }

  /**
   * Bóc tách payload JSON từ data của sự kiện SSE
   * Hỗ trợ cả định dạng OpenAI token format và cờ [DONE]
   */
  public static extractTokenPayload(event: SseRawEvent): SseTokenPayload | null {
    const rawData = event.data.trim();
    if (!rawData) return null;

    if (rawData === '[DONE]') {
      return { done: true };
    }

    try {
      const parsed = JSON.parse(rawData);
      if (typeof parsed === 'string') {
        return { token: parsed, done: false };
      }

      const token = parsed.token ?? parsed.delta ?? parsed.choices?.[0]?.delta?.content ?? '';
      const done = Boolean(parsed.done ?? parsed.is_finished ?? (parsed.choices?.[0]?.finish_reason === 'stop'));

      return {
        token,
        done,
        model: parsed.model,
        error: parsed.error,
      };
    } catch {
      // Neu khong phai JSON thi coi nguyen van data la token text
      return { token: rawData, done: false };
    }
  }

  /**
   * Reset bo dem ve trang thai ban dau
   */
  public reset(): void {
    this.buffer = '';
  }
}

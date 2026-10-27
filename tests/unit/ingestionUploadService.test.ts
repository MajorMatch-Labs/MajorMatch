import { afterEach, describe, expect, it, vi } from 'vitest';
import { IngestionService } from '@/modules/ingestion/services/ingestionService';
import { useProfileStore } from '@/stores/useProfileStore';

afterEach(() => vi.restoreAllMocks());

describe('Ingestion upload service boundary', () => {
  const file = { name: 'synthetic.pdf' } as File;

  it('validates once before handing off to the upload action', async () => {
    const validation = vi.spyOn(IngestionService, 'validateTranscriptFileAdvanced').mockResolvedValue({ isValid: true, file, formattedSize: '1 KB' });
    const upload = vi.fn().mockResolvedValue(undefined);
    const initialState = useProfileStore.getState();
    vi.spyOn(useProfileStore, 'getState').mockReturnValue({ ...initialState, uploadTranscriptAction: upload });
    await IngestionService.uploadTranscript(file);
    expect(validation).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(file);
  });

  it('does not submit a file that fails validation', async () => {
    vi.spyOn(IngestionService, 'validateTranscriptFileAdvanced').mockResolvedValue({ isValid: false, errorCode: 'INVALID_MIME_TYPE', errorMessage: 'Invalid PDF' });
    const store = vi.spyOn(useProfileStore, 'getState');
    await expect(IngestionService.uploadTranscript(file)).rejects.toThrow('Invalid PDF');
    expect(store).not.toHaveBeenCalled();
  });

  it('propagates asynchronous validation failures to the hook error boundary', async () => {
    vi.spyOn(IngestionService, 'validateTranscriptFileAdvanced').mockRejectedValue(new Error('Cannot read file'));
    await expect(IngestionService.uploadTranscript(file)).rejects.toThrow('Cannot read file');
  });
});

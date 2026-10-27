"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { IngestionService } from "../services/ingestionService";

/** Keep authentication, validation and upload errors out of the dropzone view. */
export function useFileUpload() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);
  const inFlight = useRef(false);

  const handleFile = async (file: File): Promise<void> => {
    const auth = useAuthStore.getState();
    if (!auth.isAuthenticated) {
      auth.openAuthModal("login");
      return;
    }
    // Acquire before async validation; store.isUploading starts only afterwards.
    if (inFlight.current || useProfileStore.getState().isUploading) return;
    inFlight.current = true;
    setPending(true);
    setErrorMsg(null);
    try {
      // The service owns the single full validation, including PDF magic bytes.
      await IngestionService.uploadTranscript(file);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Không thể bóc tách file. Vui lòng thử lại.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return { handleFile, errorMsg, isPending };
}

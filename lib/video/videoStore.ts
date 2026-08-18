// ============================================================
// ClipRadar AI — Global Video File Store (In-Memory)
// Retains user uploaded File object across client route navigation
// ============================================================

class VideoFileStore {
  private file: File | null = null;
  private objectUrl: string | null = null;

  setFile(file: File | null) {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.file = file;
    if (file) {
      this.objectUrl = URL.createObjectURL(file);
    }
  }

  getFile(): File | null {
    return this.file;
  }

  getObjectUrl(): string | null {
    return this.objectUrl;
  }
}

export const videoFileStore = new VideoFileStore();

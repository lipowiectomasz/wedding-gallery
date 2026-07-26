const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export function validatePhotoFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = Math.round(file.size / (1024 * 1024));
    return `Plik jest za duży (${sizeMb} MB). Wybierz zdjęcie mniejsze niż 15 MB.`;
  }

  return null;
}

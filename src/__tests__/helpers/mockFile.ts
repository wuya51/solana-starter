export function createMockFile(
  name: string,
  content = "test content",
  type = "text/plain",
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

export function createMockImageFile(
  name = "test-image.png",
  size = 1024,
): File {
  const content = new Uint8Array(size).fill(0);
  const blob = new Blob([content], { type: "image/png" });
  return new File([blob], name, { type: "image/png" });
}

export function createMockFileList(files: File[]): FileList {
  // Create a mock FileList since DataTransfer is not available in jsdom
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  };

  // Add indexed access
  files.forEach((file, index) => {
    (fileList as unknown as Record<number, File>)[index] = file;
  });

  return fileList as unknown as FileList;
}

import { BlobUploader } from "@/components/BlobUploader";
import { useUploadBlobs } from "@shelby-protocol/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockFile, createMockFileList } from "../helpers/mockFile";
import {
  mockStorageAccount,
  mockStorageAccountWithAddress,
  mockUploadBlobs,
  mockUploadBlobsPending,
} from "../helpers/mockShelby";
import {
  mockWalletConnected,
  mockWalletDisconnected,
} from "../helpers/mockWallet";
import { renderWithProviders } from "../helpers/renderWithProviders";

// Helper to upload a file to the input
function uploadFile(file: File) {
  const fileInput = document.getElementById(
    "blob-file-upload",
  ) as HTMLInputElement;
  const fileList = createMockFileList([file]);
  Object.defineProperty(fileInput, "files", {
    value: fileList,
    configurable: true,
  });
  fireEvent.change(fileInput, { target: { files: fileList } });
}

describe("BlobUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWalletDisconnected();
    mockStorageAccount();
    mockUploadBlobs();
  });

  describe("disabled states", () => {
    it("shows connect message when wallet not connected", () => {
      mockWalletDisconnected();
      renderWithProviders(
        <BlobUploader currentStep={2} fundedStorageAddress={null} />,
      );

      expect(
        screen.getByText("Connect your wallet first to upload blobs."),
      ).toBeInTheDocument();
    });

    it("shows fund message when connected but not funded", () => {
      mockWalletConnected();
      renderWithProviders(
        <BlobUploader currentStep={2} fundedStorageAddress={null} />,
      );

      expect(
        screen.getByText("Fund your storage account first to upload blobs."),
      ).toBeInTheDocument();
    });

    it("does not show file input when disabled", () => {
      mockWalletDisconnected();
      renderWithProviders(
        <BlobUploader currentStep={2} fundedStorageAddress={null} />,
      );

      expect(
        screen.queryByRole("button", { name: /Choose File/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("enabled state", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress("storage-address-123");
    });

    it("shows file input when connected and funded", () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      expect(
        screen.getByRole("button", { name: /Choose File/i }),
      ).toBeInTheDocument();
    });

    it("applies glow to Choose File at step 2 with no file selected", () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const chooseFileButton = screen.getByRole("button", {
        name: /Choose File/i,
      });
      expect(chooseFileButton).toHaveClass("glow-pulse");
    });

    it("shows selected file info after selection", async () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("test-file.txt", "Hello World");
      uploadFile(file);

      expect(screen.getByText("test-file.txt")).toBeInTheDocument();
    });

    it("shows Upload button after file selection", async () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("test-file.txt");
      uploadFile(file);

      expect(
        screen.getByRole("button", { name: /^Upload$/i }),
      ).toBeInTheDocument();
    });

    it("applies glow to Upload button at step 2 with file selected", async () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("test-file.txt");
      uploadFile(file);

      const uploadButton = screen.getByRole("button", { name: /^Upload$/i });
      expect(uploadButton).toHaveClass("glow-pulse");
    });
  });

  describe("upload flow", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress("storage-address-123");
    });

    it("shows Uploading... on button when isPending", async () => {
      mockUploadBlobsPending();

      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("test.txt");
      uploadFile(file);

      expect(
        screen.getByRole("button", { name: /Uploading.../i }),
      ).toBeInTheDocument();
    });

    it("button is disabled while uploading", async () => {
      mockUploadBlobsPending();

      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("test.txt");
      uploadFile(file);

      const uploadButton = screen.getByRole("button", {
        name: /Uploading.../i,
      });
      expect(uploadButton).toBeDisabled();
    });
  });

  describe("file selection", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress("storage-address-123");
    });

    it("displays file name after selection", () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("my-selected-file.txt");
      uploadFile(file);

      expect(screen.getByText("my-selected-file.txt")).toBeInTheDocument();
    });

    it("shows file size after selection", () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const file = createMockFile("sized-file.txt", "some content here");
      uploadFile(file);

      // File size should be displayed
      expect(screen.getByText(/KB/)).toBeInTheDocument();
    });
  });

  describe("component structure", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress("storage-address-123");
    });

    it("has a hidden file input", () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      const fileInput = document.getElementById("blob-file-upload");
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass("sr-only");
    });

    it("has a Choose File button", () => {
      renderWithProviders(
        <BlobUploader
          currentStep={2}
          fundedStorageAddress="storage-address-123"
        />,
      );

      expect(
        screen.getByRole("button", { name: /Choose File/i }),
      ).toBeInTheDocument();
    });
  });
});

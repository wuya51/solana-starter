"use client";

import { Button } from "@/components/ui/button";
import { useFundAccount } from "@/hooks/useFundAccount";
import { shelbyClient } from "@/utils/shelbyClient";
import { useStorageAccount } from "@shelby-protocol/solana-kit/react";
import { useWalletConnection } from "@solana/react-hooks";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function handleFundingError(errorMessage: string): void {
  toast.error(errorMessage);
}

interface StorageAccountManagerProps {
  currentStep: number;
  onStorageAccountReady?: (address: string) => void;
  onAccountFunded?: () => void;
}

export const StorageAccountManager = memo(function StorageAccountManager({
  currentStep,
  onStorageAccountReady,
  onAccountFunded,
}: StorageAccountManagerProps) {
  const { wallet, status } = useWalletConnection();
  const { fundAccount, isFunding } = useFundAccount();

  const [isFunded, setIsFunded] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Derive storage account from connected wallet
  const { storageAccountAddress } = useStorageAccount({
    client: shelbyClient,
    wallet,
  });

  const connected = status === "connected";
  const storageAddressStr = storageAccountAddress?.toString() ?? null;

  // Notify parent when storage account is ready
  useEffect(() => {
    if (storageAddressStr && connected) {
      onStorageAccountReady?.(storageAddressStr);
    }
  }, [storageAddressStr, connected, onStorageAccountReady]);

  // Reset funded state when wallet/storage address changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally depends on storageAddressStr to reset state
  useEffect(() => {
    setIsFunded(false);
  }, [storageAddressStr]);

  const handleFundAccount = useCallback(async () => {
    if (!storageAddressStr) return;

    try {
      setStatusMessage("Funding account with ShelbyUSD and APT...");
      await fundAccount(storageAddressStr);
      setIsFunded(true);
      setStatusMessage(null);
      toast.success("Account funded successfully!");
      onAccountFunded?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatusMessage(null);
      handleFundingError(errorMessage);
    }
  }, [storageAddressStr, fundAccount, onAccountFunded]);

  if (!connected) {
    return (
      <div className="glass-neon rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Storage Account
        </h2>
        <p className="text-muted-foreground">
          Connect your Solana wallet to view your storage account.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-neon rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Storage Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Your Shelby storage account is automatically derived from your
          connected wallet. Fund it to start uploading blobs.
        </p>
      </div>

      {/* Storage Account Address */}
      {storageAddressStr && (
        <div className="relative space-y-2 p-4 bg-success/10 rounded-lg border border-success/30">
          <span className="text-sm font-medium text-success">
            Storage Account Address
          </span>
          <p className="text-sm font-mono break-all">{storageAddressStr}</p>
          {isFunded && (
            <span className="absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-success/20 text-success">
              Funded
            </span>
          )}
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <p
          className={`text-sm ${statusMessage.startsWith("Error") ? "text-destructive" : "text-muted-foreground"}`}
        >
          {statusMessage}
        </p>
      )}

      {/* Action Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleFundAccount}
          disabled={isFunding || !storageAddressStr || isFunded}
          variant="outline"
          className={`flex-1 ${currentStep === 1 ? "glow-pulse" : ""}`}
        >
          {isFunding ? "Funding..." : "Fund Account"}
        </Button>
      </div>
    </div>
  );
});

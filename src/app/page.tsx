"use client";

import { BlobUploader } from "@/components/BlobUploader";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { NextSteps } from "@/components/NextSteps";
import { StorageAccountManager } from "@/components/StorageAccountManager";
import { YouWinOverlay } from "@/components/YouWinOverlay";
import { useWalletConnection } from "@solana/react-hooks";
import { useCallback, useRef, useState } from "react";

export default function Home() {
  const { status } = useWalletConnection();
  const connected = status === "connected";

  const nextStepsRef = useRef<HTMLDivElement>(null);
  const [storageAccountAddress, setStorageAccountAddress] = useState<
    string | null
  >(null);
  const [isFunded, setIsFunded] = useState(false);
  const [hasUploadedBlob, setHasUploadedBlob] = useState(false);
  const [showYouWin, setShowYouWin] = useState(false);
  const [showNextStepsGlow, setShowNextStepsGlow] = useState(false);

  // Calculate current step for glow guidance
  // Steps: 0 = Connect, 1 = Fund, 2 = Upload
  const completedSteps = [connected, isFunded, hasUploadedBlob];
  const currentStep = completedSteps.findIndex((c) => !c); // -1 when all complete

  const handleStorageAccountReady = useCallback((address: string) => {
    setStorageAccountAddress(address);
  }, []);

  const handleAccountFunded = useCallback(() => {
    setIsFunded(true);
  }, []);

  const handleFirstBlobUploaded = useCallback(() => {
    setHasUploadedBlob(true);
    setShowYouWin(true);
    setShowNextStepsGlow(true);
  }, []);

  const handleYouWinComplete = useCallback(() => {
    setShowYouWin(false);
    nextStepsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleNextStepsLinkClick = useCallback(() => {
    setShowNextStepsGlow(false);
  }, []);

  return (
    <div className="min-h-screen p-5">
      <YouWinOverlay show={showYouWin} onComplete={handleYouWinComplete} />
      <div className="max-w-4xl mx-auto">
        <Header currentStep={currentStep} />
      </div>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <HowItWorks
            isWalletConnected={connected}
            isFunded={isFunded}
            hasUploadedBlob={hasUploadedBlob}
          />

          <StorageAccountManager
            currentStep={currentStep}
            onStorageAccountReady={handleStorageAccountReady}
            onAccountFunded={handleAccountFunded}
          />

          <BlobUploader
            currentStep={currentStep}
            fundedStorageAddress={isFunded ? storageAccountAddress : null}
            onFirstBlobUploaded={handleFirstBlobUploaded}
          />

          {hasUploadedBlob && (
            <NextSteps
              ref={nextStepsRef}
              showGlow={showNextStepsGlow}
              onLinkClick={handleNextStepsLinkClick}
            />
          )}
        </div>
      </main>
    </div>
  );
}

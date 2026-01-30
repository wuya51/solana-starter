import { shelbyClient } from "@/utils/shelbyClient";
import { useCallback, useState } from "react";

const DEFAULT_FUNDING_AMOUNT = 1_000_000_000;

interface FundAccountResult {
  storageAccountAddress: string;
  funded: {
    shelbyUsd?: boolean;
    apt?: boolean;
  };
}

interface UseFundAccountReturn {
  fundAccount: (storageAccountAddress: string) => Promise<FundAccountResult>;
  isFunding: boolean;
  error: string | null;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    maxDelayMs?: number;
    initialDelayMs?: number;
  } = {},
): Promise<T> {
  const { maxRetries = 3, maxDelayMs = 15000, initialDelayMs = 1000 } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) break;

      // Exponential backoff with jitter, capped at maxDelayMs
      const baseDelay = initialDelayMs * 2 ** attempt;
      const jitter = Math.random() * 0.3 * baseDelay;
      const delay = Math.min(baseDelay + jitter, maxDelayMs);

      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export const useFundAccount = (): UseFundAccountReturn => {
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fundAccount = useCallback(
    async (storageAccountAddress: string): Promise<FundAccountResult> => {
      setIsFunding(true);
      setError(null);

      try {
        const results: { shelbyUsd?: boolean; apt?: boolean } = {};

        // Fund with ShelbyUSD and APT in parallel for better performance
        await Promise.all([
          withRetry(() =>
            shelbyClient.fundAccountWithShelbyUSD({
              address: storageAccountAddress,
              amount: DEFAULT_FUNDING_AMOUNT,
            }),
          ).then(() => {
            results.shelbyUsd = true;
          }),
          withRetry(() =>
            shelbyClient.fundAccountWithAPT({
              address: storageAccountAddress,
              amount: DEFAULT_FUNDING_AMOUNT,
            }),
          ).then(() => {
            results.apt = true;
          }),
        ]);

        return {
          storageAccountAddress,
          funded: results,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error(
          "Error funding account (retries exhausted):",
          errorMessage,
        );
        setError(errorMessage);
        throw err;
      } finally {
        setIsFunding(false);
      }
    },
    [],
  );

  return {
    fundAccount,
    isFunding,
    error,
  };
};

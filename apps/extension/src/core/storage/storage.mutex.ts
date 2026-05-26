/**
 * Simple async mutex for chrome.storage.local operations.
 *
 * Prevents race conditions when multiple tabs/content scripts
 * try to read-modify-write storage at the same time.
 *
 * Usage:
 *   const release = await storageMutex.acquire();
 *   try {
 *     // ... read, modify, write storage ...
 *   } finally {
 *     release();
 *   }
 */

type ReleaseFunction = () => void;

class StorageMutex {
  private queue: Array<(release: ReleaseFunction) => void> = [];
  private locked = false;

  /**
   * Acquire the lock. If another operation is already holding it,
   * this will wait in line until it's our turn.
   *
   * ALWAYS call the returned `release()` function when done,
   * preferably in a `finally` block so it releases even on errors.
   */
  acquire(): Promise<ReleaseFunction> {
    return new Promise<ReleaseFunction>((resolve) => {
      const tryAcquire = () => {
        if (!this.locked) {
          this.locked = true;
          resolve(() => this.release());
        } else {
          // Someone else has the lock — wait in line
          this.queue.push(tryAcquire);
        }
      };

      tryAcquire();
    });
  }

  /**
   * Release the lock and let the next waiter in.
   */
  private release(): void {
    this.locked = false;
    const next = this.queue.shift();
    if (next) {
      next(() => this.release());
    }
  }
}

/** Singleton mutex for all link storage operations */
export const storageMutex = new StorageMutex();

import Cookies from "js-cookie";

type AuthFailureListener = () => void;
type RefreshHandler = () => Promise<string | null>;
type TokenChangeListener = (token: string | null) => void;
const ACCESS_TOKEN_COOKIE = "__tsca";

class TokenManager {
  private inMemoryAccessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private failureListeners = new Set<AuthFailureListener>();
  private tokenListeners = new Set<TokenChangeListener>();
  private refreshHandler: RefreshHandler | null = null;

  public getAccessToken(): string | null {
    if (this.inMemoryAccessToken) {
      return this.inMemoryAccessToken;
    }

    const token = Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;

    if (token) {
      this.inMemoryAccessToken = token;
    }

    return token;
  }

  public setAccessToken(token: string | null): void {
    this.inMemoryAccessToken = token;

    if (token) {
      Cookies.set(ACCESS_TOKEN_COOKIE, token, {
        expires: 1 / 24,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    } else {
      Cookies.remove(ACCESS_TOKEN_COOKIE, {
        path: "/",
      });
    }

    this.tokenListeners.forEach((listener) => {
      listener(token);
    });
  }

  public subscribeTokenChange(listener: TokenChangeListener): () => void {
    this.tokenListeners.add(listener);

    return () => {
      this.tokenListeners.delete(listener);
    };
  }

  public clear(): void {
    this.inMemoryAccessToken = null;
    this.refreshPromise = null;
  }

  public setRefreshHandler(handler: RefreshHandler): void {
    this.refreshHandler = handler;
  }

  public subscribeAuthFailure(listener: AuthFailureListener): () => void {
    this.failureListeners.add(listener);
    return () => {
      this.failureListeners.delete(listener);
    };
  }

  public notifyAuthFailure(): void {
    this.clear();
    this.failureListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in auth failure listener:", err);
      }
    });
  }

  /**
   * Concurrency-safe refresh call.
   * If a refresh request is already in-flight, subsequent callers wait for
   * that single in-flight promise rather than spawning multiple requests.
   */
  public async executeRefresh(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const handler = this.refreshHandler;
    if (!handler) {
      this.notifyAuthFailure();
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const nextToken = await handler();
        this.setAccessToken(nextToken);
        if (!nextToken) {
          this.notifyAuthFailure();
        }
        return nextToken;
      } catch (error) {
        this.notifyAuthFailure();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

export const tokenManager = new TokenManager();

import type { Account } from "./types";

abstract class BaseService {
  abstract send(): Promise<unknown>;
  abstract createAccount(_: unknown): Account;
}

export { BaseService };

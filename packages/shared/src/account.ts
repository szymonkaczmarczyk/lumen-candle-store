import type { AddressInput } from "./address.js";

export interface AddressView extends AddressInput {
  id: string;
  isDefault: boolean;
}

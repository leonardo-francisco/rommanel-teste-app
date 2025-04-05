import { Address } from "./address.model";

export interface Client {
  id?: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  birthDate: Date;
  phone: string;
  email?: string;
  address: Address;
  freeIE: boolean;
  ie?: string;
}
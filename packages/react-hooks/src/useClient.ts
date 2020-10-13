import { createContext, useContext } from 'react';
import { Client } from '@clync/client';

export const ClientContext = createContext<Client | null>(null);

export const ClientProvider = ClientContext.Provider;

export function useClient() {
  return useContext(ClientContext);
}

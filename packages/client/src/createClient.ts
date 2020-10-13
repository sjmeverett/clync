import { Client } from './Client';

export interface ClientPlugin {
  (client: Client): Client;
}

export function createClient(client: Client, ...plugins: ClientPlugin[]) {
  return plugins.reduce((client, plugin) => plugin(client), client);
}

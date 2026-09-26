import type { Client } from './types';

/** Lowercases and strips accents so "joão" matches "Joao". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Clients whose name contains the search term, ignoring case and accents. An empty term returns all. */
export function filterClientsByName(clients: Client[], term: string): Client[] {
  const needle = normalize(term);
  if (!needle) return clients;
  return clients.filter((client) => normalize(client.name).includes(needle));
}

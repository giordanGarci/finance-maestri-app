import { describe, expect, it } from 'vitest';
import type { Client } from './types';
import { filterClientsByName } from './clientSearch';

function client(name: string): Client {
  return { id: name, name, createdAt: new Date() };
}

const clients = [client('João Silva'), client('Maria Souza'), client('Ana Paula')];

describe('filterClientsByName', () => {
  it('returns every client for an empty or blank term', () => {
    expect(filterClientsByName(clients, '')).toEqual(clients);
    expect(filterClientsByName(clients, '   ')).toEqual(clients);
  });

  it('matches any part of the name, ignoring case', () => {
    expect(filterClientsByName(clients, 'SOUZA').map((c) => c.name)).toEqual(['Maria Souza']);
  });

  it('ignores accents on both sides', () => {
    expect(filterClientsByName(clients, 'joao').map((c) => c.name)).toEqual(['João Silva']);
    expect(filterClientsByName([client('Joao')], 'João').map((c) => c.name)).toEqual(['Joao']);
  });

  it('returns nothing when no name matches', () => {
    expect(filterClientsByName(clients, 'pedro')).toEqual([]);
  });
});

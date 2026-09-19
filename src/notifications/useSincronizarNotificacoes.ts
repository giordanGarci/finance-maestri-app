import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { parcelaConverter, preferenciaAvisoDoc, toPreferenciaAviso } from '../data/collections';
import { db } from '../data/firebaseConfig';
import type { Parcela, PreferenciaAviso } from '../domain/types';
import { sincronizarNotificacoes } from './agendamento';
import { estaNoExpoGo } from './permissoes';

/**
 * Mantém os agendamentos de notificação coerentes com o estado atual,
 * escutando todas as Parcelas (via collectionGroup, já que `parcelas` é
 * subcoleção de cada Empréstimo) e a Preferência de aviso, e chamando
 * `sincronizarNotificacoes` a cada mudança em qualquer uma delas. Como os
 * agendamentos são locais (ADR-0002), isso substitui ter que lembrar de
 * chamar `sincronizarNotificacoes` manualmente em cada tela que cria um
 * Empréstimo ou marca uma Parcela como paga.
 *
 * Chamar uma vez na raiz do app. `ativo` deve ficar `false` até haver um
 * usuário logado (as regras do Firestore exigem `request.auth != null` para
 * ler `parcelas`/`config`). No-op no Expo Go (ver `permissoes.ts`): não faz
 * sentido escutar Firestore só para chamar uma sincronização que vai
 * ignorar tudo de qualquer forma.
 */
export function useSincronizarNotificacoes(ativo: boolean): void {
  useEffect(() => {
    if (!ativo || estaNoExpoGo()) {
      return;
    }

    let parcelas: Parcela[] = [];
    let preferencia: PreferenciaAviso | undefined;

    const sincronizar = () => {
      if (preferencia) {
        void sincronizarNotificacoes(parcelas, preferencia);
      }
    };

    const pararParcelas = onSnapshot(
      collectionGroup(db, 'parcelas').withConverter(parcelaConverter),
      (snapshot) => {
        parcelas = snapshot.docs.map((doc) => doc.data());
        sincronizar();
      }
    );

    const pararPreferencia = onSnapshot(preferenciaAvisoDoc(), (snapshot) => {
      preferencia = toPreferenciaAviso(snapshot.data());
      sincronizar();
    });

    return () => {
      pararParcelas();
      pararPreferencia();
    };
  }, [ativo]);
}

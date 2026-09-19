import type { Client, Loan } from '../domain/types';

export type RootStackParamList = {
  ClientsList: undefined;
  ClientForm: { client?: Client } | undefined;
  ClientDetail: { client: Client };
  LoanForm: { clientId: string; loan?: Loan };
  LoanDetail: { loan: Loan };
  Contributions: undefined;
  NotificationPreference: undefined;
};

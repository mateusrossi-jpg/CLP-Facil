import { AccountSession } from './accountAccess';

export const EASY_CLP_PRO_PRODUCT_ID = 'easy_clp_pro_lifetime';

export type ProAccessSource = 'none' | 'beta_account_mock' | 'google_play';

export type ProAccessState = {
  isPro: boolean;
  source: ProAccessSource;
  productId: string;
  accountEmail?: string;
  accountProvider?: AccountSession['provider'];
  googlePurchaseToken?: string;
  orderId?: string;
  purchasedAt?: string;
};

export type ProCommerceResult = {
  access: ProAccessState;
  message: string;
};

export const initialProAccess: ProAccessState = {
  isPro: false,
  source: 'none',
  productId: EASY_CLP_PRO_PRODUCT_ID,
};

export const proFeatureGroups = [
  ['Temporizadores avançados', 'TON, TOF e TP com preset, acumulado e diagnóstico.'],
  ['Contadores completos', 'CTU, CTD, CTUD e RES para eventos e produção.'],
  ['Comparadores e matemática', 'EQU, NEQ, GRT, LES, GEQ, LEQ, ADD, SUB, MUL, DIV e MOV.'],
  ['Modelos avançados', 'Reversão, estrela-triângulo, intertravamentos e aplicações guiadas.'],
  ['Projetos próprios', 'Salvar, duplicar, organizar e exportar entram nesta camada.'],
  ['Experiência sem anúncios', 'Preparado para remover anúncios se o plano livre usar anúncios no futuro.'],
] as const;

function createMockProAccess(account: AccountSession): ProAccessState {
  return {
    isPro: true,
    source: 'beta_account_mock',
    productId: EASY_CLP_PRO_PRODUCT_ID,
    accountEmail: account.email ?? undefined,
    accountProvider: account.provider,
    googlePurchaseToken: account.provider === 'google' ? `beta-token-${account.email}` : undefined,
    orderId: account.provider === 'google' ? `GPA.BETA-${Date.now()}` : undefined,
    purchasedAt: new Date().toISOString(),
  };
}

function requireAccount(account: AccountSession): ProCommerceResult | null {
  if (account.isSignedIn && account.email) return null;
  return {
    access: initialProAccess,
    message: 'Entre com e-mail ou Google antes da compra. A licença Pro ficará vinculada à conta, não apenas ao dispositivo.',
  };
}

export async function purchaseProBetaMock(account: AccountSession): Promise<ProCommerceResult> {
  const accountError = requireAccount(account);
  if (accountError) return accountError;

  return {
    access: createMockProAccess(account),
    message: `Compra Pro simulada e vinculada a ${account.email}. No build de loja, o Google Play Billing confirmará o token da compra nesta conta.`,
  };
}

export async function restoreProBetaMock(account: AccountSession): Promise<ProCommerceResult> {
  const accountError = requireAccount(account);
  if (accountError) return accountError;

  return {
    access: createMockProAccess(account),
    message: `Restauração simulada para ${account.email}. Depois o backend validará a compra única com Google Play Developer API.`,
  };
}

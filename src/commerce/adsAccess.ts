export const EASY_CLP_AD_UNITS = {
  bannerLearning: 'easy_clp_banner_learning',
  bannerProjects: 'easy_clp_banner_projects',
  interstitialAfterPractice: 'easy_clp_interstitial_after_practice',
} as const;

export type AdPlacement = keyof typeof EASY_CLP_AD_UNITS;

export type AdsAccessState = {
  enabled: boolean;
  provider: 'beta_mock' | 'admob';
  mutedByPro: boolean;
};

export const initialAdsAccess: AdsAccessState = {
  enabled: true,
  provider: 'beta_mock',
  mutedByPro: false,
};

export function shouldShowAds(isPro: boolean, ads: AdsAccessState) {
  return ads.enabled && !isPro && !ads.mutedByPro;
}

export function labelForAdPlacement(placement: AdPlacement) {
  if (placement === 'bannerLearning') return 'Espaço educativo';
  if (placement === 'bannerProjects') return 'Espaço de apoio';
  return 'Intervalo de prática';
}

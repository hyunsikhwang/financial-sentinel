export interface FearGreedData {
  x: number;
  y: number;
}

export interface FearGreedApiResponse {
  fear_and_greed_historical: {
    data: FearGreedData[];
  };
}

export interface BondRow {
  ITEM_CODE1: string;
  ITEM_NAME1: string;
  DATA_VALUE: string;
  TIME: string;
}

export interface EcosApiResponse {
  StatisticSearch: {
    row: BondRow[];
  };
}

export enum Sentiment {
  EXTREME_FEAR = "EXTREME FEAR",
  FEAR = "FEAR",
  NEUTRAL = "NEUTRAL",
  GREED = "GREED",
  EXTREME_GREED = "EXTREME GREED",
}

export interface KofiaMarginRow {
  TMPV1: string; // YYYYMMDD
  TMPV2: number; // Total Margin Loan Balance (백만원)
  TMPV3: number; // KOSPI Margin Loan Balance (백만원)
  TMPV4: number; // KOSDAQ Margin Loan Balance (백만원)
  TMPV5?: number; // Total Short Sale Balance
  TMPV6?: number; // KOSPI Short Sale Balance
  TMPV7?: number; // KOSDAQ Short Sale Balance
  TMPV8?: number;
  TMPV9?: number; // Customer Deposit (백만원)
}

export interface KofiaApiResponse {
  unit: string;
  ds1: KofiaMarginRow[];
  dsmHeader?: string;
}


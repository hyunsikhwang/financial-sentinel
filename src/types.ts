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

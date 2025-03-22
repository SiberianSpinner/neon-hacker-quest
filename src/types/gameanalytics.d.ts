
interface GameAnalyticsStatic {
  GameAnalytics: (
    method: string,
    ...args: any[]
  ) => void;
}

interface Window {
  gameanalytics: GameAnalyticsStatic;
}

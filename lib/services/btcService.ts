export interface BtcPriceData {
    btc: number;
}

export interface CoinGeckoResponse {
    data: {
        amount: string;
    }
}

export class BtcService {
    private static readonly COINBASE_API_URL = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';

    static async getCurrentPrice(): Promise<number> {
        try {
            const response = await fetch(this.COINBASE_API_URL);

            if (!response.ok) {
                throw new Error(`Failed to fetch BTC price: ${response.statusText}`);
            }

            const jsonResponse: CoinGeckoResponse = await response.json();
            const btcPrice = parseFloat(jsonResponse?.data?.amount);

            if (btcPrice === undefined) {
                throw new Error('BTC price not found in response');
            }

            return btcPrice;
        } catch (error) {
            console.error('Error fetching BTC price:', error);
            throw error;
        }
    }
} 
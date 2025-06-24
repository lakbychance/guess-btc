"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserPageClientProps {
    userId: string;
    initialScore: number;
    initialBtcPrice: number;
    latestGuessResolved: boolean;
    latestGuessRecordedBtcValue: number | null;
    latestGuessPrediction: 'UP' | 'DOWN' | null;
}

export default function UserPageClient({ userId, initialScore, initialBtcPrice, latestGuessResolved: _latestGuessResolved,
    latestGuessRecordedBtcValue: _latestGuessRecordedBtcValue, latestGuessPrediction: _latestGuessPrediction
}: UserPageClientProps) {
    const [score, setScore] = useState(initialScore);
    const [btcPrice, setBtcPrice] = useState<number>(initialBtcPrice);
    const [latestGuessResolved, setLatestGuessResolved] = useState(_latestGuessResolved);
    const [latestGuessRecordedBtcValue, setLatestGuessRecordedBtcValue] = useState<number | null>(_latestGuessRecordedBtcValue);
    const [latestGuessPrediction, setLatestGuessPrediction] = useState<string | null>(_latestGuessPrediction);
    const GUESS_RESOLUTION_INTERVAL_MS = 60000;
    const BTC_PRICE_REFRESH_INTERVAL_MS = 5000;

    useEffect(() => {
        const fetchBtcPrice = async () => {
            const btcPrice = await fetch('/api/btc-value');
            const data = await btcPrice.json();
            setBtcPrice(data.btc);
        };
        const interval = setInterval(fetchBtcPrice, BTC_PRICE_REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (latestGuessResolved) {
            return;
        }

        const checkGuessResult = async () => {
            try {
                const res = await fetch(`/api/check-guess-result?userId=${userId}`);
                const data = await res.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                if (data.resolved) {
                    const message = data.isCorrect ? 'You were right!' : 'You were wrong!';
                    if (data.isCorrect) {
                        toast.success(message);
                    } else {
                        toast.error(message);
                    }
                    if (data.updatedScore !== undefined) {
                        setScore(data.updatedScore);
                    }
                    setLatestGuessResolved(true);
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                } else {
                    toast.error('An unknown error occurred while checking resolution.');
                }
                setLatestGuessResolved(true);
            }
        };

        const interval = setInterval(checkGuessResult, GUESS_RESOLUTION_INTERVAL_MS);
        return () => clearInterval(interval);

    }, [latestGuessResolved, userId]);

    const handleGuess = async (prediction: 'UP' | 'DOWN') => {
        try {
            const res = await fetch('/api/make-guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    prediction,
                    recordedBTCValue: btcPrice,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to make a guess.');
            }

            setLatestGuessResolved(false);
            setLatestGuessRecordedBtcValue(btcPrice);
            setLatestGuessPrediction(prediction);
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('An unknown error occurred while making the guess.');
            }
            setLatestGuessResolved(true); // Re-enable buttons on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <header className="absolute top-4 left-4">
                <p className="text-lg">Score: {score}</p>
            </header>

            <main className="flex flex-col items-center justify-start pt-48">
                <div className="text-center">
                    <h2 className="text-5xl font-bold mb-4">
                        {btcPrice ? `$${btcPrice.toLocaleString()}` : 'Loading BTC price...'}

                    </h2>
                    <p className="text-xl mb-6">Which way will the BTC value go in next 1 minute ?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => handleGuess('UP')}
                            disabled={!latestGuessResolved}
                            className="px-6 py-2 bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-500"
                        >
                            Up
                        </button>
                        <button
                            onClick={() => handleGuess('DOWN')}
                            disabled={!latestGuessResolved}
                            className="px-6 py-2 bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-500"
                        >
                            Down
                        </button>
                    </div>
                    {latestGuessRecordedBtcValue && latestGuessPrediction && (
                        <p className="text-lg mt-4 text-blue-400">
                            Latest Prediction made against: ${latestGuessRecordedBtcValue.toLocaleString()} ({latestGuessPrediction})
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
} 
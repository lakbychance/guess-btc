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
    lastGuessCreatedAt: Date | null;
}

export default function UserPageClient({ userId, initialScore, initialBtcPrice, latestGuessResolved: _latestGuessResolved,
    latestGuessRecordedBtcValue: _latestGuessRecordedBtcValue, latestGuessPrediction: _latestGuessPrediction,
    lastGuessCreatedAt: _lastGuessCreatedAt
}: UserPageClientProps) {
    const [score, setScore] = useState(initialScore);
    const [btcPrice, setBtcPrice] = useState<number>(initialBtcPrice);
    const [latestGuessResolved, setLatestGuessResolved] = useState(_latestGuessResolved);
    const [latestGuessRecordedBtcValue, setLatestGuessRecordedBtcValue] = useState<number | null>(_latestGuessRecordedBtcValue);
    const [latestGuessPrediction, setLatestGuessPrediction] = useState<string | null>(_latestGuessPrediction);
    const [lastGuessCreatedAt, setLastGuessCreatedAt] = useState<Date | null>(_lastGuessCreatedAt);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [isCheckingGuessResult, setIsCheckingGuessResult] = useState(false);
    const GUESS_RESOLUTION_TIME_MS = 60000;
    const BTC_PRICE_REFRESH_INTERVAL_MS = 5000;

    const formatTimeElapsed = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        return `${seconds}s`;
    };

    const checkGuessResult = async () => {
        if (isCheckingGuessResult) {
            return;
        }
        setIsCheckingGuessResult(true);
        try {
            const res = await fetch(`/api/check-guess-result?userId=${userId}`);
            const data = await res.json();

            setIsCheckingGuessResult(false);

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.resolved) {
                if (data.isCorrect !== undefined) {
                    const message = data.isCorrect ? 'You were right!' : 'You were wrong!';
                    if (data.isCorrect) {
                        toast.success(message);
                    } else {
                        toast.error(message);
                    }
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

    useEffect(() => {
        if (latestGuessResolved) {
            setTimeElapsed(0);
            return;
        }

        const updateElapsedTime = () => {
            if (!lastGuessCreatedAt) {
                return;
            }
            const currentTime = Date.now();
            const elapsed = currentTime - lastGuessCreatedAt.getTime();
            setTimeElapsed(elapsed);
            if (elapsed >= GUESS_RESOLUTION_TIME_MS) {
                checkGuessResult();
            }
        };

        // Update immediately
        updateElapsedTime();

        // Then update every second
        const interval = setInterval(updateElapsedTime, 1000);
        return () => clearInterval(interval);
    }, [lastGuessCreatedAt, latestGuessResolved]);

    useEffect(() => {
        const fetchBtcPrice = async () => {
            const btcPrice = await fetch('/api/btc-value');
            const data = await btcPrice.json();
            setBtcPrice(data.btc);
        };
        const interval = setInterval(fetchBtcPrice, BTC_PRICE_REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);



    const handleGuess = async (prediction: 'UP' | 'DOWN') => {
        setLatestGuessResolved(false);
        setLatestGuessRecordedBtcValue(btcPrice);
        setLatestGuessPrediction(prediction);
        setLastGuessCreatedAt(new Date());
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('An unknown error occurred while making the guess.');
            }
            setLatestGuessResolved(true);
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
                        <div className="mt-4">
                            <p className="text-lg text-blue-400">
                                Latest Prediction made against: ${latestGuessRecordedBtcValue.toLocaleString()} ({latestGuessPrediction})
                            </p>
                            {!latestGuessResolved && timeElapsed > 0 && (
                                <p className="text-md text-yellow-400 mt-2">
                                    Time elapsed: {formatTimeElapsed(timeElapsed)}
                                </p>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
} 
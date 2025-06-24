import { UserService, BtcService, GuessService } from '../../lib/services';
import UserPageClient from './UserPageClient';
import { notFound } from 'next/navigation';



export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const [userData, btcPrice] = await Promise.all([
        UserService.findUserByUsername(username),
        BtcService.getCurrentPrice(),
    ]);

    if (!userData) {
        notFound();
    }

    const latestGuess = await GuessService.getLatestGuessForUser(userData.id);

    return (
        <UserPageClient
            userId={userData.id}
            initialScore={userData.score}
            initialBtcPrice={btcPrice}
            latestGuessResolved={latestGuess?.resolvedAt !== null}
            latestGuessRecordedBtcValue={latestGuess?.recordedBTCValue ?? null}
            latestGuessPrediction={latestGuess?.prediction ?? null}
        />
    );
}

# Guess BTC – Bitcoin Price Prediction Game

A POC of Bitcoin price prediction game. Players guess whether Bitcoin’s price will rise or fall within a 1-minute window.

## Features

1. Users start by creating a player profile on the landing page, which redirects them to the `/username` route.
2. On the `/username` page, the user's score appears in the top-left corner (starting at 0 for new players), along with the current BTC price in USD, which updates at regular intervals using the Coinbase API.
3. Players predict whether the price will go up or down in the next minute. After submitting a guess, the buttons are temporarily disabled.
4. Once atleast a minute has passed since the last guess, the app displays a toast message indicating whether the prediction was correct.
5. A correct guess increases the player’s score by 1. An incorrect guess decreases it by 1, but the score never drops below 0.

## Running the App

```bash
npm install
```

Create a .env file with the following:

```env
DATABASE_URL=your_mongodb_connection_string
```

Then run the app:

```bash
npm run dev
```

## Testing the App
Currently has tests written for the `userService` and `guessService` which handles the business logic for the app

Create a .env.test file with:
```env
DATABASE_URL=your_mongodb_connection_string_for_tests
```

Run the tests:
```bash
npm test
```

## Deploying the App
- A nextjs app can be deployed on multiple platforms. We just need to ensure setting up the env variables before hand in respective dashboard. 
- The commands `npm build` followed by `npm start` will start the project there. 
// Created a file for the simplest caching approach. This was also needed, because I didn't want to create merge conflicts with Keenan working 
// in the Home.jsx file on his side for the CSV readings.

// For our approach, I felt this was the most appropriate, since our system first will try and use the readings from the central node and only will then
// cache the readings once its received the connection. A entire file cached approach might also work brilliantly since JSON takes up slightly more data.

// The cap is 5MB for local storage, but 2 of the day's worth of data only is about 25KB worth of CSV data. For this implementation where it will only need to
//  save 7 days worth of data at a time, this is more adequete. For more than a handful of nodes, we will need an IndexDB approach, 
//  that doesn't have the 5MB cap.

// Question for future tickets: Does the central node know which data it has sent to the frontend? If so, then I this implementation where I don't have to 
// check for duplicate data is fine, if not a check must be implemented to ensure accurate data is displayed to the farmer.

const KEY = "vitisense:readings";

export async function saveReadings(readings) {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), readings }));
}

export async function loadReadings() {
    const saved = localStorage.getItem(KEY);
    if (!saved) return { readings: [], savedAt: null };
    return JSON.parse(saved);
}

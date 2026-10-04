// ------ Placeholder leaf node details ------ CREATED WITH AI FOR TESTING PURPOSES
// TODO replace with requests to the backend

// each leaf node's own readings, signal and place on the farm
// x and y are positions on the mock farm map (300 wide, 200 tall)
const NODE_DETAILS = {
    "LN-01": {
        lastReading: "14:56", signal: -61,
        location: { block: "A", row: 4, x: 56, y: 54 },
        readings: { temperature: 19.4, humidity: 93, leafWetness: 60, wind: 3.1 },
    },
    "LN-02": {
        lastReading: "14:56", signal: -67,
        location: { block: "A", row: 12, x: 112, y: 72 },
        readings: { temperature: 19.9, humidity: 91, leafWetness: 55, wind: 2.8 },
    },
    "LN-03": {
        lastReading: "13:48", signal: -88,
        location: { block: "B", row: 3, x: 196, y: 52 },
        readings: { temperature: 20.6, humidity: 86, leafWetness: 41, wind: 3.6 },
    },
    "LN-04": {
        lastReading: "14:56", signal: -70,
        location: { block: "B", row: 10, x: 252, y: 70 },
        readings: { temperature: 21.1, humidity: 84, leafWetness: 38, wind: 4.0 },
    },
    "LN-05": {
        lastReading: "11:20", signal: null, // no signal right now
        location: { block: "C", row: 6, x: 62, y: 148 },
        readings: { temperature: 17.2, humidity: 97, leafWetness: 81, wind: 1.9 },
    },
    "LN-06": {
        lastReading: "14:56", signal: -64,
        location: { block: "D", row: 8, x: 226, y: 160 },
        readings: { temperature: 20.2, humidity: 89, leafWetness: 47, wind: 3.3 },
    },
};

// pretends to ask the central node for one leaf node's details
// takes a short moment, like a real request, so the loading animation shows
export function fetchLeafNodeDetails(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const details = NODE_DETAILS[id];
            if (details) {
                resolve({ id, ...details });
            } else {
                reject(new Error(`No details for ${id}`));
            }
        }, 800);
    });
}

// layout of the mock farm map: vineyard blocks and every leaf node
export const FARM_MAP = {
    width: 300,
    height: 200,
    blocks: [
        { name: "A", x: 16, y: 16, width: 124, height: 72 },
        { name: "B", x: 160, y: 16, width: 124, height: 72 },
        { name: "C", x: 16, y: 112, width: 124, height: 72 },
        { name: "D", x: 160, y: 112, width: 124, height: 72 },
    ],
    nodes: Object.entries(NODE_DETAILS).map(([id, details]) => ({ id, ...details.location })),
};
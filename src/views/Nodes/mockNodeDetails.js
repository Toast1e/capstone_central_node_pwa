// ------ Placeholder leaf node details ------ CREATED WITH AI FOR TESTING PURPOSES
// TODO replace with requests to the backend

// each leaf node's own readings, signal and place on  the mock farm map, found by leafNodeID
// // (the ID never changes, unlike the name, which the farmer can edit)
// x and y are positions on the mock farm map (300 wide, 200 tall)
const NODE_DETAILS = [
    {
        leafNodeID: 1,
        lastReading: "14:56",
        signal: -61,
        location: { block: "A", row: 4, x: 56, y: 54 },
    },
    {
        leafNodeID: 2,
        lastReading: "14:56",
        signal: -67,
        location: { block: "A", row: 12, x: 112, y: 72 },
     },
    {
        leafNodeID: 3,
        lastReading: "13:48",
        signal: -88,
        location: { block: "B", row: 3, x: 196, y: 52 },
    },
    {
        leafNodeID: 4,
        lastReading: "14:56",
        signal: -70,
        location: { block: "B", row: 10, x: 252, y: 70 },
    },
    {
        leafNodeID: 5,
        lastReading: "11:20",
        signal: null,   // no signal right now
        location: { block: "C", row: 6, x: 62, y: 148 },
    },
    {
        leafNodeID: 6,
        lastReading: "14:56",
        signal: -64,
        location: { block: "D", row: 8, x: 226, y: 160 },
    },
];

// pretends to ask the central node for one leaf node's details
// takes a short moment, like a real request, so the loading animation shows
export function fetchLeafNodeDetails(leafNodeID) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const details = NODE_DETAILS.find((node) => node.leafNodeID === leafNodeID);
            if (details) {
                resolve({ details });
            } else {
                reject(new Error(`No details for leaf node ${leafNodeID}`));
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
    // each pin: its leafNodeID plus its x and y on the drawing
    nodes: NODE_DETAILS.map((node) => ({leafNodeID: node.leafNodeID, ...node.location })),
};
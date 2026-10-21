// ------ Mildew risk thresholds ------
// conditions that favour each disease, from Table 1 (Velasquez-Camacho et al., 2023)
export const MILDEW_THRESHOLDS = {
    powdery: {
        label: "Powdery",
        temperature: { min: 15, max: 25 }, // °C
        humidity: { min: 40 },             // %, risk above this
        wind: { min: 2.3 },                // m/s, risk above this
    },
    downy: {
        label: "Downy",
        temperature: { min: 6, max: 26 },  // °C
        humidity: { min: 90 },             // %, risk above this
        wind: { min: 9.0 },                // m/s, risk above this
    },
};
// ------ VitiSense app theme ------
// every antd component in the app reads its colours, corners and font from here
import {theme} from "antd";

const sharedTokens = {
    borderRadius: 10, // nice rounded corners
    fontFamily: "var(--font-jakarta), sans-serif",
}

const sharedComponents = {
    Card: {borderRadiusLG: 14},
    Button: {fontWeight: 600},
}

// light mode theme
export const lightTheme = {
    algorithm: theme.defaultAlgorithm, // ant designs normal light mode colours
    token: {
        ...sharedTokens,
        colorPrimary: "#6B4C9A",    // buttons, links, focus outlines
        colorSuccess: "#4C9A5F",    // leaf node green: "OK" tags
        colorLink: "#6B4C9A",   // links purple like primary colour
        colorBgLayout: "#F5F2EE",   // warm stone page background
        colorBorderSecondary: "#E7E1DA",    // soft card borders
        colorTextBase: "#2B2530",   // text colour (secondary grey is worked out from this)
    },
    components: {
        ...sharedComponents,
        // darker text for warning tags only
        Tag: { colorWarning: "#A86F0A" },
    },
};

//dark mode theme
export const darkTheme = {
    algorithm: theme.darkAlgorithm, // ant designs normal dark mode colours
    token: {
        ...sharedTokens,
        colorPrimary: "#8A68C4",    // lighter purple: the normal purple is too dark to read on a dark backgrounds
        colorSuccess: "#5FB373", // lighter  green, for the same reason
        colorLink: "#8A68C4",
        colorBgLayout: "#17141C",   // dark page background
        colorBgContainer: "#221E29",    // cards, slightly lighter than the page so they stand out
        colorBgElevated: "#2E2936",       // dropdowns, pop-ups and the selected Segmented option
        colorBorderSecondary: "#38323F",    // soft card borders
        colorTextBase: "#ECE6F2",   // light text
    },
    components: sharedComponents,
};
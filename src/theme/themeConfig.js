// ------ VitiSense app theme ------
// every antd component in the app reads its colours, corners and font from here

const theme = {

    // global settings: apply to every component
    token: {
        colorPrimary: "#6B4C9A",          // grape: buttons, links, focus outlines
        colorSuccess: "#4C9A5F",          // leaf node green: "OK" tags
        colorBgLayout: "#F5F2EE",         // warm stone page background
        colorBorderSecondary: "#E7E1DA",  // soft card borders
        colorTextBase: "#2B2530",         // text colour (secondary grey is worked out from this)
        borderRadius: 10,                 // rounder corners everywhere
        fontFamily: "var(--font-jakarta), sans-serif",
    },

    // settings for one component type only
    components: {
        Card: { borderRadiusLG: 14 },
        Button: { fontWeight: 600 },
    },
};

export default theme;
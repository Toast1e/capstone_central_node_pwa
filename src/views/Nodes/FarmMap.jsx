"use client";

// UI Libraries mostly Ant design libraries
import { theme } from "antd";

// Our own data
import { FARM_MAP } from "./mockNodeDetails";


//Used AI to draw fake map with node locations.... could be changed based on actual map and real farm setup
/**
 * Drawn map of the farm with one leaf node highlighted.
 *
 * selectedId  leafNodeID for example 3
 */
export default function FarmMap({ selectedId, leafNodes }) {
    // theme colours from themeConfig.js
    const { token } = theme.useToken();

    // draw the selected node last so it sits on top of the others
    const nodes = [...FARM_MAP.nodes].sort(
        (a, b) => (a.leafNodeID === selectedId) - (b.leafNodeID === selectedId)
    );

    // the name to write next to a pin: looked up by ID, so a renamed node shows its new name
    function nameOf(leafNodeID) {
        return leafNodes.find((node) => node.leafNodeID === leafNodeID)?.leafNodeName;
    }

    return (
        <svg
            viewBox={`0 0 ${FARM_MAP.width} ${FARM_MAP.height}`}
            width="100%"
            role="img"
            aria-label={`Farm map showing where ${nameOf(selectedId)} is`}
            style={{ display: "block", background: token.colorBgLayout, borderRadius: token.borderRadius }}
        >
            {/* draws vineyard blocks, each with faint lines for the vine rows */}
            {FARM_MAP.blocks.map((block) => (
                <g key={block.name}>
                    <rect
                        x={block.x}
                        y={block.y}
                        width={block.width}
                        height={block.height}
                        rx={6}
                        fill={token.colorSuccessBg}
                        stroke={token.colorSuccessBorder}
                    />
                    {Array.from({ length: 7 }, (_, row) => (
                        <line
                            key={row}
                            x1={block.x + 8}
                            x2={block.x + block.width - 8}
                            y1={block.y + 16 + row * 8}
                            y2={block.y + 16 + row * 8}
                            stroke={token.colorSuccessBorder}
                            strokeWidth={1}
                        />
                    ))}
                    <text x={block.x + 8} y={block.y + 11} fontSize={9} fill={token.colorTextSecondary}>
                        Block {block.name}
                    </text>
                </g>
            ))}

            {/* leaf nodes, the selected one is bigger and in the theme colour */}
            {nodes.map((node) => {
                const selected = node.leafNodeID === selectedId;
                return (
                    <g key={node.leafNodeID}>
                        {selected && <circle cx={node.x} cy={node.y} r={12} fill={token.colorPrimary} opacity={0.2} />}
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={selected ? 6 : 4}
                            fill={selected ? token.colorPrimary : token.colorTextTertiary}
                            stroke={token.colorBgContainer} // ring matches the card: white in light, dark in dark
                            strokeWidth={2}
                        />
                        <text
                            x={node.x}
                            y={node.y - (selected ? 15 : 8)}
                            textAnchor="middle"
                            fontSize={selected ? 10 : 8}
                            fontWeight={selected ? 600 : 400}
                            fill={selected ? token.colorText : token.colorTextTertiary}
                            // thin outline in the block colour so labels stay readable over the vine rows
                            stroke={token.colorSuccessBg}
                            strokeWidth={3}
                            paintOrder="stroke"
                        >
                            {nameOf(node.leafNodeID)}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
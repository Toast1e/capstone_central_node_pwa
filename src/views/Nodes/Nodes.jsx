"use client";

import { useRouter } from "next/navigation";
import "../HomePages/HomePages.css";

function allLeafNodes() {
    let leafNodeAmount = 13;
    let leafNodeDetails = [];

    for (let i = 1; i <= leafNodeAmount; i++) {
        leafNodeDetails.push(
            <div className="lowRiskContainer" key={i}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: "4px" }} key={i}>
                    Leaf Node {i}
                </div>
            </div>
        );
    }

    return (leafNodeDetails);
}

export default function Nodes() {
    return (
        <div className="pageForm">
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: "4px" }}>
                Leaf Nodes
            </div>

            {allLeafNodes()}
        </div >
    );
}

"use client";

import { useRouter } from "next/navigation";
import "../HomePages/HomePages.css";

function allAlerts() {
    let alertAmount = 2;
    let alertDetails = [];

    for (let i = 1; i <= alertAmount; i++) {
        alertDetails.push(
            <div className="highRiskContainer" key={i}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: "4px" }}>
                    Downey Mildew {i}
                </div>
            </div>
        );
    }

    return (alertDetails);
}

export default function Alerts() {
    return (
        <div className="pageForm">
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: "4px" }}>
                Mildew Alerts
            </div>

            {allAlerts()}
        </div >
    );
}

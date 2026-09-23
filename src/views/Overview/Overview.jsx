"use client";

import { useRouter } from "next/navigation";
import "./Overview.css";
import "../HomePages/HomePages.css";

let connectedNode = "Central node 1";

function getLeafNodeAmount() {
    return 13;
}

function allLeafNodes() {
    let leafNodeAmount = getLeafNodeAmount();
    let leafNodeDetails = [];

    for (let i = 1; i <= leafNodeAmount; i++) {
        leafNodeDetails.push(
            <div className="container" key={i}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: "4px" }}>
                    Leaf node {i}
                </div>

                <div className='pageGrid'>
                    <div className='elementGrid'>
                        <p>Humidity</p>
                    </div>

                    <div className='elementGrid'>
                        <p>Temperature</p>
                    </div>

                    <div className='elementGrid'>
                        <p>Leaf wetness</p>
                    </div>

                    <div className='elementGrid'>
                        <p>Wind</p>
                    </div>
                </div>
            </div>
        );
    }

    return (leafNodeDetails);
}

export default function Overview() {
    const router = useRouter();

    return (
        <div className="pageForm">
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: "4px" }}>
                {connectedNode} Overview
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: "20px" }}>
                {getLeafNodeAmount()} leaf nodes monitored
            </div>
            {allLeafNodes()}
        </div>
    );
}

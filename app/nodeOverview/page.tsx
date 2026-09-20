import Link from 'next/link'
import { JSX, jsx } from 'react/jsx-runtime';

function getLeafNodeAmount() {
    return 3;
}

function allLeafNodes() {
    let leafNodeAmount: number = getLeafNodeAmount();
    let leafNodeDetails: JSX.Element[] = [];

    for (let i = 1; i <= leafNodeAmount; i++) {
        leafNodeDetails.push(
            <div className="container">
                <h2>Leaf node {i}</h2>
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

export default function NodeOverview() {
    return (
        <div className="text-center font-Arial pageForm">
            <header>
                <h3>VitiSense: Live</h3>
                <Link href="/">Login</Link>
            </header>

            <div className="container">
                <h2>Central Node 1 Overview</h2>
                <p>{getLeafNodeAmount()} leaf nodes monitored</p>
            </div>

            {allLeafNodes()}

            <footer className='pageFlex'>
                <Link className='btn elementFlex' href="/nodeOverview">Overview</Link>
                <Link className='btn elementFlex' href="/alerts">Alerts</Link>
                <Link className='btn elementFlex' href="/nodes">Nodes</Link>
                <Link className='btn elementFlex' href="/exportInfo">Export</Link>
            </footer>
        </div >
    );
}

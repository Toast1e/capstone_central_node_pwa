import Link from 'next/link'
import { JSX } from 'react/jsx-runtime';

function allLeafNodes() {
    let leafNodeAmount: number = 3;
    let leafNodeDetails: JSX.Element[] = [];

    for (let i = 1; i <= leafNodeAmount; i++) {
        leafNodeDetails.push(
            <div className="moderateRiskContainer">
                <b><h4>Leaf Node {i}</h4></b>
            </div>
        );
    }

    return (leafNodeDetails);
}

export default function Nodes() {
    return (
        <div className="text-center font-Arial pageForm">
            <header>
                <h3>VitiSense: Live</h3>
                <Link href="/">Login</Link>
            </header>

            <div className="container">
                <h1>Leaf Nodes</h1>
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

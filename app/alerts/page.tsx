import Link from 'next/link'
import { JSX } from 'react/jsx-runtime';

function allAlerts() {
    let alertAmount: number = 2;
    let alertDetails: JSX.Element[] = [];

    for (let i = 1; i <= alertAmount; i++) {
        alertDetails.push(
            <div className="highRiskContainer">
                <h4>Downey Mildew {i}</h4>
            </div>
        );
    }

    return (alertDetails);
}

export default function Alerts() {
    return (
        <div className="text-center font-Arial pageForm">
            <header>
                <h3>VitiSense: Live</h3>
                <Link href="/">Login</Link>
            </header>

            <div className="container">
                <h1>Mildew Alerts</h1>
            </div>

            {allAlerts()}

            <footer className='pageFlex'>
                <Link className='btn elementFlex' href="/nodeOverview">Overview</Link>
                <Link className='btn elementFlex' href="/alerts">Alerts</Link>
                <Link className='btn elementFlex' href="/nodes">Nodes</Link>
                <Link className='btn elementFlex' href="/exportInfo">Export</Link>
            </footer>
        </div >
    );
}

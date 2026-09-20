import Link from 'next/link'

export default function ExportInfo() {
    return (
        <div className="text-center font-Arial pageForm">
            <header>
                <h3>VitiSense: Live</h3>
                <Link href="/">Login</Link>
            </header>

            <div className="container">
                <h1>Export Vineyard Data</h1>
            </div>

            <footer className='pageFlex'>
                <Link className='btn elementFlex' href="/nodeOverview">Overview</Link>
                <Link className='btn elementFlex' href="/alerts">Alerts</Link>
                <Link className='btn elementFlex' href="/nodes">Nodes</Link>
                <Link className='btn elementFlex' href="/exportInfo">Export</Link>
            </footer>
        </div >
    );
}

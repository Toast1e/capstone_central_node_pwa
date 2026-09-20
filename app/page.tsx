import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center font-Arial pageForm">
      <header>
        <h1>VitiSense</h1>
      </header>

      <div className="container">
        <p>Mildew early warning system for vineyards</p>
        <form action="">
          <div className="form-group text-left">
            <label htmlFor="edtPassword" className="text-left">Password</label><br />
            <input className="form-control" type="password" name="edtPassword" id="edtPassword" /><br />
          </div>


          <div className="form-group text-left">
            <input type="checkbox" name="chkSignedIn" id="chkSignedIn" />
            <label htmlFor="chkSignedIn">Keep me signed in on this device</label><br /><br />
          </div>

          <button className="btn btn-primary form-control" type="submit">Sign In</button>
        </form>
        <Link href="/nodeOverview">Node overview</Link>
      </div>
    </div>
  );
}

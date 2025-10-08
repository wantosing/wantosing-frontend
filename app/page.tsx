import Link from "next/link";

export const metadata = { title: 'Home | WantoSing' };

export default function Home() {
  return (
    <main>
      <div className="hero min-h-screen bg-base-100">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Wantosing</h1>
            <p className="py-6 text-lg">Choosing the song for karaoke🎤</p>
            <div className="flex justify-center">
              <Link href={'/session'}>
                <button className="btn  btn-outline btn-success btn-lg ">🔑 Login with your music platform</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

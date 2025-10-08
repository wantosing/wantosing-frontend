import SessionLayout from '../session/layout'

export default function SessionLayoutSettings({ children }: { children: React.ReactNode }) {
    return (
        <div >
            <SessionLayout>
                {children}
            </SessionLayout>
        </div  >
    );
}

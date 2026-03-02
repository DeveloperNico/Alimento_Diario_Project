import Header from "@/app/components/Header";
import ProgressoLeitura from "@/app/components/ProgressoLeitura";
import CalendarioLeitura from "@/app/components/CalendarioLeitura";

export default function CronogramaPage() {
    return (
        <main>
            <Header />
            <div className="px-4 space-y-6">
                <ProgressoLeitura />
                <CalendarioLeitura />
            </div>
        </main>
    );
}
import Header from "../components/Header";
import VersiculoDoDia from "../components/VersiculoDoDia";
import ProgressoLeitura from "../components/ProgressoLeitura";
import LeituraDeHoje from "../components/LeituraDeHoje";
import CalendarioLeitura from "../components/CalendarioLeitura";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Home() {
    return (
        <ProtectedRoute>
            <main>
                <Header />

                <section className="flex flex-col justify-center items-center mt-10">
                    <h2 className="font-poppins text-4xl font-bold cursor-default">Alimento Diário</h2>
                    <p className="font-poppins text-lg mt-2 cursor-default">Sua jornada pela Bíblia em 365 dias</p>
                </section>

                <VersiculoDoDia />
                <ProgressoLeitura />
                <LeituraDeHoje />
            </main>
        </ProtectedRoute>
    );
};
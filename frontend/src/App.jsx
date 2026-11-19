import { Route, Routes } from "react-router-dom";
import EnTete from "./components/EnTete";
import PiedDePage from "./components/PiedDePage";
import PageAccueil from "./pages/PageAccueil";
import PageConnexion from "./pages/PageConnexion";
import PageInscription from "./pages/PageInscription";
import RouteProtegee from "./components/RouteProtegee";
import PageCreationEvenement from "./pages/PageCreationEvenement";
import PageRechercheEvenements from "./pages/PageRechercheEvenements";
import PageDetailEvenement from "./pages/PageDetailEvenement";
import PageMesEvenements from "./pages/PageMesEvenements";
import PageModificationEvenement from "./pages/PageModificationEvenement";

export default function App() {
  return (
    // Colonne sur toute la hauteur : l'en-tête en haut, le pied de page en bas,
    // et "flex-1" fait grandir le contenu pour pousser le pied de page vers le bas.
    <div className="flex min-h-screen flex-col bg-creme">
      <EnTete />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PageAccueil />} />
          <Route path="/connexion" element={<PageConnexion />} />
          <Route path="/inscription" element={<PageInscription />} />
          <Route path="/evenements" element={<PageRechercheEvenements />} />
          <Route
            path="/evenements/creer"
            element={
              <RouteProtegee>
                <PageCreationEvenement />
              </RouteProtegee>
            }
          />
          <Route path="/evenements/:id" element={<PageDetailEvenement />} />
          <Route path="/mes-evenements" element={
            <RouteProtegee>
              <PageMesEvenements />
            </RouteProtegee>
          } />
          <Route
            path="/evenements/:id/modifier"
            element={
              <RouteProtegee>
                <PageModificationEvenement />
              </RouteProtegee>
            }
          />  
        </Routes>
      </main>

      <PiedDePage />
    </div>
  );
}
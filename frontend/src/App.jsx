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
import PageProfil from "./pages/PageProfil";
import PagePasTrouvee from "./pages/PagePasTrouvee";
import PageMotDePasseOublie from "./pages/PageMotDePasseOublie";
import PageReinitialisation from "./pages/PageReinitialisation";
import PageSport from "./pages/PageSport";
import PageOrganisateur from "./pages/PageOrganisateur";
import BandeauDemonstration from "./components/BandeauDemonstration";

export default function App() {
  return (
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
          <Route
            path="/profil"
            element={
              <RouteProtegee>
                <PageProfil />
              </RouteProtegee>
            }
          />
          <Route path="/sports/:sport" element={<PageSport />} />
          <Route path="/organisateurs/:id" element={<PageOrganisateur />} />
          <Route path="/mot-de-passe-oublie" element={<PageMotDePasseOublie />} />
          <Route path="/reinitialisation-mot-de-passe" element={<PageReinitialisation />} />
          <Route path="*" element={<PagePasTrouvee />} />
        </Routes>
      </main>

      <BandeauDemonstration />
      <PiedDePage />
    </div>
  );
}
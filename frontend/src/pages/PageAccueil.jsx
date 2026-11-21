import SectionPresentation from "../components/accueil/SectionPresentation";
import SectionCommentCaMarche from "../components/accueil/SectionCommentCaMarche";
import SectionSports from "../components/accueil/SectionSports";
import BandeauAppel from "../components/accueil/BandeauAppel";

// La page d'accueil n'est qu'un assemblage de sections : chaque morceau vit dans son fichier
export default function PageAccueil() {
  return (
    <>
      <SectionPresentation />
      <SectionCommentCaMarche />
      <SectionSports />
      <BandeauAppel />
    </>
  );
}
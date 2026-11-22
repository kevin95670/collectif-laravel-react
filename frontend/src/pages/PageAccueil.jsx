import SectionPresentation from "../components/accueil/SectionPresentation";
import SectionCommentCaMarche from "../components/accueil/SectionCommentCaMarche";
import SectionSports from "../components/accueil/SectionSports";
import BandeauAppel from "../components/accueil/BandeauAppel";
import SectionAPropos from "../components/accueil/SectionAPropos";
import SectionProchainsEvenements from "../components/accueil/SectionProchainsEvenements";
import SectionRencontres from "../components/accueil/SectionRencontres";
import SectionTemoignages from "../components/accueil/SectionTemoignages";
import BandeauFinal from "../components/accueil/BandeauFinal";

// La page d'accueil n'est qu'un assemblage de sections : chaque morceau vit dans son fichier
export default function PageAccueil() {
  return (
    <>
      <SectionPresentation />
      <SectionCommentCaMarche />
      <SectionSports />
      <BandeauAppel />
      <SectionAPropos />
      <SectionProchainsEvenements />
      <SectionRencontres />
      <SectionTemoignages />
      <BandeauFinal />
    </>
  );
}
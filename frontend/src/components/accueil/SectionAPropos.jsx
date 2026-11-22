import ZonePhotoDecorative from "../ZonePhotoDecorative";

// Section 03 : photo à gauche, texte à droite (empilés sur mobile)
export default function SectionAPropos() {
  return (
    <section className="grid bg-white md:grid-cols-2">
      <ZonePhotoDecorative
        src="/images/accueil-apropos.webp"
        couleur="#5E8BC4"
        legende="Photo : groupe d'amis après l'effort"
        className="min-h-[320px] md:min-h-[620px]"
      />

      <div className="flex flex-col items-center justify-center px-8 py-16 text-center md:px-20">
        <div className="numero">03</div>
        <h2 className="mt-5 text-5xl">Pourquoi Collectif</h2>
        <div className="sous-titre mt-4">- à propos -</div>

        <p className="texte-maj mt-6 max-w-md text-xs">
          Collectif est l'endroit où l'on trouve du monde pour jouer, courir ou marcher.
        </p>

        {/* Le petit trait vertical décoratif, comme sur l'ouverture */}
        <div className="my-7 h-14 w-px bg-brand" />

        <p className="max-w-md text-sm leading-7 text-gris">
          Pas de groupes de messagerie à rallier, pas de tableur à tenir à jour. Une page par événement, des places
          comptées automatiquement, un chat et des alertes : l'organisateur organise, les autres n'ont plus qu'à venir.
        </p>

        {/* Pas de page « à propos » : le bouton remonte vers la section « comment ça marche » (étape 3) */}
        <a href="#comment-ca-marche" className="bouton mt-8">En savoir plus</a>
      </div>
    </section>
  );
}
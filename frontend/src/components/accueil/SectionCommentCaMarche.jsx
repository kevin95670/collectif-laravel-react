// Les quatre étapes, en trois "habillages" différents (variantes) comme dans la maquette
function CarteEtape({ numero, titre, texte, variante }) {
  const animationSurvol = "transition duration-300 hover:-translate-y-2 hover:shadow-xl motion-reduce:transition-none";

  // Contenu commun aux trois variantes ; seules les couleurs changent
  const contenu = (couleurTitre, couleurTexte, couleurTrait) => (
    <>
      <h3 className={"text-3xl " + couleurTitre}>{titre}</h3>
      <div className={"mx-auto my-4 h-px w-16 " + couleurTrait} />
      <p className={"text-sm leading-7 " + couleurTexte}>{texte}</p>
      <p className="mt-8 text-xs font-bold tracking-[0.14em]">{numero}.</p>
    </>
  );

  if (variante === "marine") {
    // rounded-tr-[130px] : seul le coin haut droit est arrondi (l'"arche" de la maquette)
    return (
      <div className={"rounded-tr-[130px] bg-marine px-8 pb-8 pt-11 text-center text-white " + animationSurvol}>
        {contenu("text-white", "text-[#DCE6F5]", "bg-white/50")}
      </div>
    );
  }

  if (variante === "ciel") {
    return (
      <div className={"rounded-tr-[130px] bg-ciel px-8 pb-8 pt-11 text-center " + animationSurvol}>
        {contenu("text-marine", "text-gris", "bg-marine/40")}
      </div>
    );
  }

  // variante "cadre" : cadre ciel avec un intérieur blanc
  return (
    <div className={"bg-ciel p-2.5 " + animationSurvol}>
      <div className="h-full bg-white px-7 pb-7 pt-11 text-center">
        {contenu("text-marine", "text-gris", "bg-marine/40")}
      </div>
    </div>
  );
}

const AVANTAGES = [
  "Adresse et horaires précis",
  "Nombre de places maximum",
  "Chat sous chaque événement",
  "Alertes email en cas de changement",
];

export default function SectionCommentCaMarche() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr_0.8fr]">
          <div>
            <div className="numero">01</div>
            <h2 className="mt-8 text-4xl">Un événement, du premier message au coup d'envoi</h2>
            <div className="sous-titre mt-8">- comment ça marche -</div>
          </div>

          <div>
            <p className="texte-maj text-xs">
              On simplifie chaque étape pour que tu passes plus de temps sur le terrain que dans les messages.
            </p>
            <p className="mt-5 text-sm leading-7 text-gris">
              Un organisateur crée un événement avec son adresse, ses horaires et un nombre de places. Les autres le
              trouvent dans la liste, s'inscrivent, <em>discutent dans le chat</em> et reçoivent un email si quelque
              chose change.
            </p>
          </div>

          <ul>
            {AVANTAGES.map((avantage) => (
              <li key={avantage} className="flex items-center gap-3 py-1.5 text-sm text-gris">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA7B8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {avantage}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CarteEtape numero="01" variante="marine" titre="Créer"
            texte="Donne un titre, une adresse, une date et un nombre de places. Ton événement est en ligne tout de suite." />
          <CarteEtape numero="02" variante="ciel" titre="Rejoindre"
            texte="Choisis un événement près de chez toi et inscris-toi en un clic : ta place est réservée." />
          <CarteEtape numero="03" variante="cadre" titre="Discuter"
            texte="Un chat sous chaque événement, pour se coordonner et prévenir en cas de retard." />
          <CarteEtape numero="04" variante="cadre" titre="Rester informé"
            texte="Horaire modifié, lieu changé, événement annulé : tu reçois un email." />
        </div>
      </div>
    </section>
  );
}
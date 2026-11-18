export default function CarteEvenement({ titre, adresse, dateDebut, nombrePlacesMax }) {
  return (
    // Cadre bleu ciel avec un léger soulèvement au survol.
    <article className="bg-ciel p-2.5 transition-transform duration-300 hover:-translate-y-2">
      <div className="bg-white px-7 py-9 text-center">
        <h3 className="text-3xl">{titre}</h3>

        {/* Petit trait de séparation : bg-marine/40 = marine à 40 % d'opacité */}
        <div className="mx-auto my-4 h-px w-14 bg-marine/40"></div>

        <p className="text-sm leading-7">{adresse}</p>
        <p className="text-sm leading-7">{dateDebut}</p>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
          {nombrePlacesMax} places
        </p>
      </div>
    </article>
  );
}
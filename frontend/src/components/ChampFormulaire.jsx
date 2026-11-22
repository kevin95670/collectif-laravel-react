export default function ChampFormulaire({ id, libelle, type = "text", valeur, auChangement, erreurs, multiligne = false }) {
  // focus:border-brand : la bordure devient bleue quand on clique dans le champ
  const classesChamp = "mt-2 w-full border border-line bg-white px-4 py-3 text-sm text-marine focus:border-brand";

  return (
    <div className="mt-5 first:mt-0">
      <label className="block text-xs font-bold uppercase tracking-[.09em] text-marine" htmlFor={id}>{libelle}</label>

      {/* multiligne = true : une zone de texte (textarea) ; sinon un champ simple (input) */}
      {multiligne ? (
        <textarea
          id={id}
          rows={4}
          value={valeur}
          onChange={(evenement) => auChangement(evenement.target.value)}
          className={classesChamp}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={valeur}
          onChange={(evenement) => auChangement(evenement.target.value)}
          className={classesChamp}
        />
      )}

      {erreurs && <p className="mt-1 text-sm font-bold text-brand">{erreurs[0]}</p>}
    </div>
  );
}
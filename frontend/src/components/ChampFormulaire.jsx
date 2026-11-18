export default function ChampFormulaire({ id, libelle, type = "text", valeur, auChangement, erreurs, multiligne = false }) {
  const classesChamp = "mt-1 w-full border border-line bg-white px-4 py-3";

  return (
    <div className="mt-5 first:mt-0">
      <label className="block text-sm font-bold text-marine" htmlFor={id}>{libelle}</label>

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
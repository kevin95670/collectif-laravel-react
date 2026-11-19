export default function ChampSelection({ id, libelle, valeur, auChangement, options, erreurs }) {
  return (
    <div className="mt-5 first:mt-0">
      <label className="block text-sm font-bold text-marine" htmlFor={id}>{libelle}</label>

      <select
        id={id}
        value={valeur}
        onChange={(evenement) => auChangement(evenement.target.value)}
        className="mt-1 w-full border border-line bg-white px-4 py-3"
      >
        {/* Une <option> par élément de la liste. key = identifiant unique, comme :key en Vue */}
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>{option.libelle}</option>
        ))}
      </select>

      {erreurs && <p className="mt-1 text-sm font-bold text-brand">{erreurs[0]}</p>}
    </div>
  );
}
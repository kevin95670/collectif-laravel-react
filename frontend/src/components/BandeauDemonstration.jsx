// Bandeau affiché au-dessus du pied de page, sur toutes les pages
export default function BandeauDemonstration() {
  return (
    <div className="bg-ciel px-4 py-3 text-center text-xs text-marine">
      <p className="mx-auto max-w-4xl leading-relaxed">
        <strong className="font-semibold uppercase tracking-widest">Site de démonstration</strong>
        {" "}
        Projet personnel : les événements d'exemple, les témoignages, le téléphone et l'adresse e-mail
        affichés sont fictifs. N'y saisissez pas de vraies données.
      </p>
    </div>
  );
}
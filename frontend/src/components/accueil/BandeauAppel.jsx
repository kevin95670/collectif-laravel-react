import { Link } from "react-router-dom";

// Bloc marine « appel à l'action »
export default function BandeauAppel() {
  return (
    <section className="bg-creme pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="bg-marine px-10 py-16 text-center">
          <h2 className="text-4xl text-white">Un créneau, un terrain, des potes ?</h2>
          <p className="texte-maj mt-4 text-xs text-[#DCE6F5]">Lance ton événement en deux minutes.</p>
          {/* Le suffixe "!" force la couleur par-dessus celle de la classe .bouton */}
          <Link to="/evenements/creer" className="bouton mt-8 inline-block bg-creme! text-marine! hover:bg-white!">
            Créer un événement
          </Link>
        </div>
      </div>
    </section>
  );
}
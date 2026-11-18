import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";

export default function MenuUtilisateur() {
  const { utilisateur, seDeconnecter } = useUtilisateur();
  const naviguer = useNavigate();

  // true = le menu est ouvert par un clic
  const [ouvert, setOuvert] = useState(false);

  // useRef = une "poignée" vers un élément HTML réel (comme this.$refs en Vue).
  // Elle sert à savoir si un clic a eu lieu dans le menu ou en dehors.
  const conteneurRef = useRef(null);

  useEffect(() => {
    function fermerSiClicDehors(evenement) {
      // conteneurRef.current = l'élément <div> ; contains() teste si le clic est à l'intérieur
      if (conteneurRef.current && !conteneurRef.current.contains(evenement.target)) {
        setOuvert(false);
      }
    }

    document.addEventListener("mousedown", fermerSiClicDehors);

    // La fonction retournée est le "nettoyage" : React l'appelle quand le composant disparaît.
    // Sans elle, l'écouteur resterait actif pour toujours.
    return () => document.removeEventListener("mousedown", fermerSiClicDehors);
  }, []);

  async function deconnecter() {
    await seDeconnecter();
    setOuvert(false);
    naviguer("/");
  }

  const classesLien = "block px-5 py-3 text-sm font-bold text-marine hover:bg-ciel";

  return (
    // "group" (Tailwind) : permet aux enfants de réagir au survol de ce parent
    <div ref={conteneurRef} className="group relative">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-label="Menu du compte"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-marine text-marine hover:bg-ciel"
      >
        {/* Petit bonhomme en SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      </button>

      {/* Visible si "ouvert" (clic), OU au survol sur ordinateur (md:group-hover:block).
          Le pt-2 (et non un mt) garde le menu collé au bouton : sinon le survol se perdrait. */}
      <div className={`absolute right-0 top-full z-20 pt-2 ${ouvert ? "block" : "hidden"} md:group-hover:block`}>
        <div className="w-56 border border-line bg-white shadow-carte">
          <p className="border-b border-line px-5 py-3 text-xs text-gris">{utilisateur.name}</p>
          <Link to="/profil" onClick={() => setOuvert(false)} className={classesLien}>Mon profil</Link>
          <Link to="/mes-evenements" onClick={() => setOuvert(false)} className={classesLien}>Mes événements</Link>
          <button type="button" onClick={deconnecter} className={`${classesLien} w-full text-left`}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
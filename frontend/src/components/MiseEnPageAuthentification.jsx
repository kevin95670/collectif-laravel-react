import ZonePhotoDecorative from "./ZonePhotoDecorative";

// "children" : tout ce qui est écrit entre les balises du composant (comme <slot> en Vue)
export default function MiseEnPageAuthentification({ image, legende, children }) {
  return (
    <section className="grid md:min-h-[640px] md:grid-cols-2">
      {/* hidden md:block : la photo n'apparaît qu'à partir de la taille tablette */}
      <div className="hidden md:block">
        <ZonePhotoDecorative src={image} couleur="#1F4F8F" legende={legende} className="h-full min-h-[640px]" />
      </div>

      <div className="flex items-center justify-center px-6 py-14 md:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </section>
  );
}
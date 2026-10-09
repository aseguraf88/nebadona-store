// Botón redondo de 40 px sobre la foto de la ficha (volver, compartir).
// Colores fijos, no del tema, para que se lea sobre fotos claras y oscuras
const PhotoActionButton = ({ icon: Icon, label, onClick, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-gray-900 shadow-md backdrop-blur-sm transition-colors hover:bg-white active:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
        <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
)

export default PhotoActionButton

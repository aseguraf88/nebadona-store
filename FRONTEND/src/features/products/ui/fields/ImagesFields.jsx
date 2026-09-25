import { TbCloudUpload } from 'react-icons/tb'

const ImagesFields = ({ template, hasImages, onOpenGallery }) =>
    !hasImages ? (
        <div
            onClick={onOpenGallery}
            className="w-full border-2 border-dashed border-base-300 rounded-xl p-8 flex flex-col items-center cursor-pointer bg-base-200/20 hover:bg-base-200/50"
        >
            <TbCloudUpload className="text-4xl text-primary mb-2" />
            <span className="font-bold text-base-content">
                Abrir galería
            </span>
        </div>
    ) : (
        <div
            onClick={onOpenGallery}
            className="grid grid-cols-3 sm:grid-cols-6 gap-3 cursor-pointer group relative"
        >
            {template.images.map((img, index) => (
                <div
                    key={img.id}
                    className="aspect-square rounded-lg border border-base-200 overflow-hidden relative bg-base-200"
                >
                    <img
                        src={img.src}
                        alt={`Prod ${index}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    )

export default ImagesFields

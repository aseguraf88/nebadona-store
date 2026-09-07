// Sube un archivo directo a Cloudinary desde el navegador usando un preset
// "sin firmar" (unsigned). El backend nunca recibe los bytes de la imagen,
// solo la URL final — por eso los límites de payload del servidor pueden
// ser chicos (2mb) sin romper la carga de fotos de producto.
//
// Requiere en FRONTEND/.env:
//   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset_sin_firmar
//
// El preset se crea en Cloudinary: Settings → Upload → Add upload preset
// → Signing Mode: Unsigned.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadToCloudinary(file) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error(
            'Faltan VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET en FRONTEND/.env',
        )
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData },
    )

    if (!response.ok) {
        throw new Error('No se pudo subir la imagen a Cloudinary.')
    }

    const data = await response.json()
    return data.secure_url
}

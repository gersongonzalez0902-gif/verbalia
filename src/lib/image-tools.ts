/**
 * Utilidades de imagen · Redimensionar y comprimir al vuelo
 * antes de guardar en el perfil (IndexedDB), para no hinchar
 * el almacenamiento del navegador.
 */

export function resizeImageFile(
  file: File,
  width: number,
  height: number,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Recorte centrado al aspecto pedido (cover).
        const aspect = width / height;
        let w = img.width;
        let h = img.height;
        if (w / h > aspect) w = h * aspect;
        else h = w / aspect;
        const ox = (img.width - w) / 2;
        const oy = (img.height - h) / 2;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("sin contexto");
        ctx.drawImage(img, ox, oy, w, h, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen no válida"));
    };
    img.src = url;
  });
}

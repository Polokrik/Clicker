/** URL d'une illustration de public/art/ (respecte le base path GitHub Pages). */
export const art = (file: string): string => `${import.meta.env.BASE_URL}art/${file}`

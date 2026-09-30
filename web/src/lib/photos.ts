// Example photography for the fictional client. These are stand-ins: free-licence stock photographs
// (Pexels), cropped and graded to sit inside the palette (see docs/IMAGE_CREDITS.md for how, and for
// the credits). Replace with consented photographs of a real client and nothing else in the layout changes.
//
// "today" is how Marisol presents now. "direction" is a *reference* for where the consultant is heading:
// a different person, deliberately. It is never presented as her result.
export type PhotoSubject = "today" | "direction";
export type PhotoCrop = "bust" | "wide";

export type PhotoSource = { src: string; srcSet: string; width: number; height: number };

const set = (name: string, small: number, large: number) => `/portraits/${name}-${small}.jpg ${small}w, /portraits/${name}-${large}.jpg ${large}w`;

export const photos: Record<PhotoSubject, { alt: string; bust: PhotoSource; wide?: PhotoSource; wideAlt?: string; position: string }> = {
  today: {
    alt: "A woman with dark hair pinned up, in a cream knit cardigan slipping off one shoulder, looking away from the camera against a plain wall",
    bust: { src: "/portraits/today-1200.jpg", srcSet: set("today", 640, 1200), width: 1200, height: 1500 },
    position: "50% 30%",
  },
  direction: {
    alt: "A woman with a dark bob and fringe in a dark pinstripe jacket, looking straight at the camera in soft window light",
    bust: { src: "/portraits/direction-1200.jpg", srcSet: set("direction", 640, 1200), width: 1200, height: 1500 },
    wide: { src: "/portraits/direction-wide-1600.jpg", srcSet: set("direction-wide", 800, 1600), width: 1600, height: 1000 },
    wideAlt: "Detail of a dark pinstripe jacket: lapels, collar and buttons",
    position: "50% 30%",
  },
};

export const photoCredits = [
  { subject: "today" as const, title: "Woman in Knitted Cardigan", by: "Ilya Komov", url: "https://www.pexels.com/photo/11446748/", licence: "Pexels License" },
  { subject: "direction" as const, title: "Elegant Woman in Dark Pinstripe Suit Indoors", by: "Mert Coşkun", url: "https://www.pexels.com/photo/32342054/", licence: "Pexels License" },
];

/** One line for footers. */
export const photoCreditLine = "Example photography by Ilya Komov and Mert Coşkun, via Pexels.";

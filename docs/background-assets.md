# Japanese environment assets

Source: user-supplied `02f923ba-dd82-4b6f-a664-dcabb3dac3dd.png`.

Saved assets in `dist/assets/images/kaif/`:

- `japanese-landscape.png`: unchanged copy of the supplied artwork.
- `japanese-landscape.webp`: optimized runtime copy (360,872 bytes).
- `japanese-landscape-sunless.png`: sun-removal plate made with the built-in image editing tool, not the fallback CLI.
- `japanese-landscape-sunless.webp`: optimized plate (281,098 bytes).

The renderer uses only a feathered 320 × 225 sky region from the edited plate. Everything outside that region is rendered from the original artwork. The animated sun is isolated from the original artwork in memory. Foreground and mountain layers are masked duplicates, not newly generated illustrations. WebP copies were encoded at quality 90; original PNGs remain intact.

## Final image-edit prompt

Use case: precise-object-edit. Image 1 is the edit target, a supplied Japanese ink landscape background. Make a clean animation background plate: remove ONLY the circular red sun near the upper left-center sky and its small red cloud streaks immediately beside it. Seamlessly reconstruct the grayscale sky and white cloud texture behind the removed sun. Keep absolutely everything else fixed: mountain ridge shape, exact pagoda position, birds, river, waterfall, every foreground red tree, framing, aspect ratio, palette, brushwork. Do not redraw or rearrange the scene. Do not add anything, no text, no new sun, no moon, no circles or artifacts. This is not a new image design, it is a narrow object-removal edit to enable separate sun animation. Preserve original 1672x941 framing.

## Motion and sound

One shared GSAP ticker paints the environment, capped at 40 updates/sec on desktop and 24 on mobile, with DPR capped at 1.5/1. Reduced motion stops idle animation. Hidden tabs stop rendering and suspend audio. One scroll-progress trigger controls the sun; a second changes background treatment inside Selected Work. The sun never advances on a timer.

`ambience.js` creates original filtered-noise wind/water and sparse synthesized chimes. No copyrighted recordings or external audio requests. Audio is silent initially, fades in after an eligible interaction, provides a keyboard-accessible mute button, remembers the session preference, and cleans up on page exit.

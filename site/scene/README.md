# 3D desk scene

The Three.js scene on the home page: a computer on a desk whose monitor shows the
retro desktop from `app/[locale]/os` in an iframe.

Adapted from Henry Heffernan's [portfolio-website](https://github.com/henryjeff/portfolio-website)
(MIT, see `LICENSE.md` in this folder). Changes from the original:

- Runs inside the Next.js app as a client component (`components/scene/DeskScene.tsx`)
  instead of its own webpack build, on current `three` and `@tweenjs/tween.js`.
- No singletons: every part gets the `Application` it belongs to, and `destroy()`
  removes every listener, frame loop and canvas, so React can mount and unmount it.
- The loading screen and overlay are React 19 components with CSS transitions
  instead of framer-motion.
- The baked textures in `public/scene/models` have the original branding painted out
  and replaced with Nurulloxon's own.

The computer model is by Mickael Boitte and the room models by Sean Nicolas (as
credited in the original project).

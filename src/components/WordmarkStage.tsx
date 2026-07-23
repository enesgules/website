import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { DitherField } from "./DitherField";

const splitTransition = {
  type: "spring",
  duration: 0.55,
  bounce: 0,
} satisfies Transition;

const revealTransition = {
  duration: 0.28,
  ease: [0.23, 1, 0.32, 1],
} satisfies Transition;

const exitTransition = {
  duration: 0.18,
  ease: [0.4, 0, 1, 1],
} satisfies Transition;

const instantTransition = {
  duration: 0,
} satisfies Transition;

export function WordmarkStage() {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion() === true;
  const nameTransition = shouldReduceMotion
    ? instantTransition
    : splitTransition;

  const leftTransform =
    isOpen
      ? "translate3d(calc(0px - var(--wordmark-split-distance)), 0, 0)"
      : "translate3d(0, 0, 0)";
  const rightTransform =
    isOpen
      ? "translate3d(var(--wordmark-split-distance), 0, 0)"
      : "translate3d(0, 0, 0)";

  return (
    <main className="wordmark-stage" aria-labelledby="page-title">
      <h1 className="visually-hidden" id="page-title">
        Enes Gules, also known as Abdush
      </h1>

      <DitherField />

      <div className="wordmark">
        <div className="wordmark__orb-anchor">
          <motion.button
            className="wordmark__orb"
            type="button"
            aria-label={isOpen ? "Close nickname" : "Reveal nickname"}
            aria-pressed={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            whileTap={{ transform: "scale(0.96)" }}
            transition={{ duration: 0.14 }}
          >
            <ThinkingOrb
              state={isOpen ? "listening" : "composing"}
              size={64}
              theme="dark"
              speed={0.72}
              style={{ width: "64%", height: "64%" }}
            />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.span
              className="wordmark__nickname"
              initial={{
                clipPath: shouldReduceMotion
                  ? "inset(0% 0 0% 0)"
                  : "inset(48% 0 48% 0)",
                opacity: 0,
                transform: shouldReduceMotion
                  ? "none"
                  : "translate3d(0, 10%, 0) scaleX(0.92)",
              }}
              animate={{
                clipPath: "inset(0% 0 0% 0)",
                opacity: 1,
                transform: "translate3d(0, 0, 0) scaleX(1)",
              }}
              exit={{
                clipPath: shouldReduceMotion
                  ? "inset(0% 0 0% 0)"
                  : "inset(48% 0 48% 0)",
                opacity: 0,
                transform: shouldReduceMotion
                  ? "none"
                  : "translate3d(0, 4%, 0) scaleX(0.96)",
                transition: exitTransition,
              }}
              transition={revealTransition}
              aria-hidden="true"
            >
              abdush
            </motion.span>
          ) : null}
        </AnimatePresence>

        <div className="wordmark__name">
          <motion.span
            className="wordmark__half"
            animate={{ transform: leftTransform }}
            transition={nameTransition}
            aria-hidden="true"
          >
            enes
          </motion.span>
          <motion.span
            className="wordmark__right"
            animate={{ transform: rightTransform }}
            transition={nameTransition}
          >
            <span className="wordmark__half" aria-hidden="true">
              gules
            </span>
          </motion.span>
        </div>
      </div>
    </main>
  );
}

import { motion, useReducedMotion } from 'motion/react';
import { Github, Linkedin, Mail, FileText } from 'lucide-react';
import { LINKS } from '../lib/content.placeholders';
import { useIstClock } from '../hooks/useIstClock';

const BUILD_SHA: string =
  (import.meta.env.VITE_BUILD_SHA as string | undefined) ?? 'local';

/**
 * Deploy: the finale. Massive type, one contact CTA, live IST clock
 * plus build SHA as proof the run is live and traceable.
 */
export default function Deploy() {
  const reduce = useReducedMotion();
  const ist = useIstClock();

  return (
    <footer id="deploy" className="scroll-mt-24 border-t border-ink/20 dark:border-paper/20">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs tracking-[0.25em] text-signal">
            06 / DEPLOY
          </p>
          <h2 className="mt-4 font-display text-5xl font-bold leading-none tracking-tight md:text-8xl">
            Ship it.
          </h2>
          <p className="mt-5 max-w-[45ch] leading-relaxed text-ink/70 dark:text-paper/70">
            Open to research and backend roles. One message starts the run.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <a
              href={LINKS.email}
              className="inline-block bg-signal px-6 py-3 font-mono text-sm tracking-[0.12em] text-ink transition-transform duration-150 active:-translate-y-px"
            >
              Say hello
            </a>
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-ink/70 underline-offset-4 hover:underline dark:text-paper/70"
            >
              <FileText size={16} aria-hidden="true" />
              Resume
            </a>
          </div>
          <div className="mt-10 flex items-center gap-5">
            {[
              { href: LINKS.github, label: 'GitHub', Icon: Github },
              { href: LINKS.linkedin, label: 'LinkedIn', Icon: Linkedin },
              { href: LINKS.email, label: 'Email', Icon: Mail },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                className="text-ink/60 transition-colors hover:text-signal dark:text-paper/60"
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              </a>
            ))}
          </div>
        </motion.div>
        <div className="mt-16 flex flex-col justify-between gap-2 border-t border-ink/15 pt-4 font-mono text-xs tracking-[0.18em] text-ink/50 sm:flex-row dark:border-paper/15 dark:text-paper/50">
          <span>
            IST {ist || '--:--:--'}
          </span>
          <span>build {BUILD_SHA}</span>
        </div>
      </div>
    </footer>
  );
}

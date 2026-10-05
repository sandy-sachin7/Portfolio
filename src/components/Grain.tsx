// Film grain overlay. Rendered once at the App root: fixed, non-interactive,
// purely decorative (aria-hidden). Visual texture lives in the `.grain`
// class in index.css.
export default function Grain() {
  return <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[60]" />;
}

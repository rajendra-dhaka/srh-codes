export function HelpTip({ text }) {
  return (
    <span className="help-tip-wrap" tabIndex={0} aria-label={text}>
      <span className="help-tip-icon">?</span>
      <span className="help-bubble" role="tooltip">{text}</span>
    </span>
  );
}

/**
 * Tooltip — branded, animated tooltip component.
 *
 * Usage:
 *   <Tooltip text="Descriptive label">
 *     <button>Hover me</button>
 *   </Tooltip>
 *
 * Props:
 *   text      — tooltip content (string or JSX)
 *   position  — 'top' | 'bottom' | 'left' | 'right'  (default: 'top')
 *   maxWidth  — CSS max-width string (default: '220px')
 */
export function Tooltip({ text, children, position = 'top', maxWidth = '220px' }) {
    return (
        <span className={`tooltip-wrapper tooltip-${position}`} style={{ '--tooltip-max-width': maxWidth }}>
            {children}
            <span className="tooltip-bubble" role="tooltip">{text}</span>
        </span>
    );
}

export default Tooltip;

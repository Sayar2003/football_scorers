import { getRatingColor, getRatingLabel } from '../utils/ratingCalculator';

export default function RatingBadge({ rating, size = 'md' }) {
  const color = getRatingColor(rating);
  const sizes = {
    sm: { box: '32px', font: '13px' },
    md: { box: '42px', font: '16px' },
    lg: { box: '56px', font: '22px' },
  };
  const s = sizes[size];

  return (
    <div style={{
      width: s.box, height: s.box,
      borderRadius: '8px',
      backgroundColor: color,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold', fontSize: s.font,
      color: 'white', flexShrink: 0,
      title: getRatingLabel(rating)
    }}>
      {rating}
    </div>
  );
}
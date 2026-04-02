export const Loader = ({ message = 'Loading fresh meals...' }) => (
  <div className="page-loader">
    <div className="loader-orb" />
    <p>{message}</p>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid cards-grid">
    {Array.from({ length: count }).map((_, index) => (
      <div className="skeleton-card" key={index}>
        <div className="skeleton-image shimmer" />
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line shimmer short" />
      </div>
    ))}
  </div>
);

function MediaCard({
  title,
  mediaUrl,
  tags = [],
  metadata = [],
  className = '',
  onClick,
  ariaLabel,
}) {
  const content = (
    <>
      <span className="media-card__art">
        {mediaUrl ? (
          <img src={mediaUrl} alt={title} loading="lazy" />
        ) : (
          <span className="media-card__image-placeholder" aria-hidden="true">
            Imagem indisponível
          </span>
        )}
      </span>
      <span className="media-card__details">
        <span className="media-card__title">{title}</span>
        {tags.length > 0 && (
          <span className="media-card__tags">
            {tags.map((tag) => (
              <span className="media-card__tag" key={tag}>
                {tag}
              </span>
            ))}
          </span>
        )}
        {metadata.length > 0 && (
          <span className="media-card__metadata">
            {metadata.map(({ label, value }) => (
              <span className="media-card__metadata-item" key={label}>
                <span>{label}</span>
                <strong>{value || '—'}</strong>
              </span>
            ))}
          </span>
        )}
      </span>
    </>
  )

  const classes = ['media-card', className].filter(Boolean).join(' ')

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel || title}
      >
        {content}
      </button>
    )
  }

  return (
    <article className={classes} aria-label={ariaLabel || title}>
      {content}
    </article>
  )
}

export default MediaCard

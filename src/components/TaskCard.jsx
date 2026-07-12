export default function TaskCard({ card, registerRef, onPointerDown, isDragging }) {
  const hasDescription = Boolean(card.description?.trim())

  return (
    <article
      className="task-card"
      ref={registerRef}
      onPointerDown={onPointerDown}
      style={{ opacity: isDragging ? 0.35 : 1 }}
    >
      <h3 className="task-card__title">{card.title}</h3>
      {hasDescription && (
        <p className="task-card__description">{card.description}</p>
      )}
    </article>
  )
}
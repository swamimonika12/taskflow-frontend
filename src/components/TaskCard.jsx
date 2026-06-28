export default function TaskCard({ card }) {
  const hasDescription = Boolean(card.description?.trim())

  return (
    <article className="task-card">
      <h3 className="task-card__title">{card.title}</h3>
      {hasDescription && (
        <p className="task-card__description">{card.description}</p>
      )}
    </article>
  )
}

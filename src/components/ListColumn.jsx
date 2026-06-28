import { useState } from 'react'
import { createCard } from '../utils/api'
import { normalizeCard } from '../utils/normalize'
import TaskCard from './TaskCard'

export default function ListColumn({ list, onCardAdded, onError, style }) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setCreating(true)
    onError('')

    try {
      const res = await createCard({
        title: trimmedTitle,
        description: description.trim(),
        listId: list.id,
        list_id: list.id,
      })

      const card =
        normalizeCard(res.data?.data ?? res.data?.card ?? res.data) ??
        normalizeCard({
          _id: Date.now(),
          title: trimmedTitle,
          description: description.trim(),
        })

      onCardAdded(list.id, card)
      setTitle('')
      setDescription('')
      setShowAddCard(false)
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to create card')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="list-column" style={style}>
      <header className="list-column__header">
        <h2 className="list-column__title">{list.title}</h2>
        <span className="list-column__count">{list.cards.length}</span>
      </header>

      <div className="list-column__body">
        {list.cards.length === 0 && !showAddCard && (
          <p className="list-column__empty">Drop tasks here</p>
        )}

        {list.cards.map((card) => (
          <TaskCard key={card.id} card={card} />
        ))}

        {showAddCard ? (
          <form className="card-add" onSubmit={handleSubmit}>
            <input
              type="text"
              className="card-add__input"
              placeholder="Card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
            <textarea
              className="card-add__textarea"
              placeholder="Add a description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <div className="card-add__actions">
              <button
                type="submit"
                className="card-add__submit"
                disabled={creating}
              >
                {creating ? 'Adding…' : 'Add card'}
              </button>
              <button
                type="button"
                className="card-add__cancel"
                onClick={() => {
                  setShowAddCard(false)
                  setTitle('')
                  setDescription('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="list-column__add-card"
            onClick={() => setShowAddCard(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </section>
  )
}

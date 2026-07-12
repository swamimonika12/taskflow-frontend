import { Fragment, useState } from 'react'
import { createCard } from '../utils/api'
import { normalizeCard } from '../utils/normalize'
import TaskCard from './TaskCard'
import DropIndicator from './DropIndicator'

export default function ListColumn({
  list,
  onCardAdded,
  onError,
  style,
  dragging,
  dropTarget,
  onCardPointerDown,
  registerCardRef,
  registerListBodyRef,
  onDeleteList,
  deletingList,
}) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    console.log(list)
    setCreating(true)
    onError('')

    try {
      const res = await createCard({
        title: trimmedTitle,
        description: description.trim(),
        list: list.id,
        board: list.board,
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
        <button
          type="button"
          className="list-column__delete"
          onClick={(e) => onDeleteList(e, list)}
          disabled={deletingList}
          aria-label={`Delete ${list.title}`}
          title="Delete list"
        >
          {deletingList ? (
            <span className="list-column__delete-spinner" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          )}
        </button>

      </header>
      <div className="list-column__body" ref={registerListBodyRef(list.id)}>
        {list.cards.length === 0 && !showAddCard && !dragging && (
          <p className="list-column__empty">Drop tasks here</p>
        )}

        {list.cards.map((card, index) => (
          <Fragment key={card.id}>
            {dropTarget && dropTarget.listId === list.id && dropTarget.index === index && (
              <DropIndicator />
            )}
            <TaskCard
              card={card}
              registerRef={registerCardRef(card.id)}
              onPointerDown={(e) => onCardPointerDown(e, card, list.id)}
              isDragging={dragging?.cardId === card.id}
            />
          </Fragment>
        ))}

        {dropTarget && dropTarget.listId === list.id && dropTarget.index === list.cards.length && (
          <DropIndicator />
        )}

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
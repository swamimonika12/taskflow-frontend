import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ListColumn from '../components/ListColumn'
import useAuth from '../hooks/useAuth'
import {
  createList,
  getBoard,
  parseListResponse,
} from '../utils/api'
import { normalizeList, parseBoardDetailResponse } from '../utils/normalize'
import '../styles/auth-shared.css'
import '../styles/Board.css'

export default function Board() {
  const { id } = useParams()
  useAuth()

  const [board, setBoard] = useState(null)
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddList, setShowAddList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [creatingList, setCreatingList] = useState(false)

  const loadBoardData = useCallback(async () => {
    setError('')
    try {
      const boardRes = await getBoard(id)
      const { board: boardData, lists: embeddedLists } = parseBoardDetailResponse(boardRes)
      setBoard(boardData)
      setLists(embeddedLists)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBoardData()
  }, [loadBoardData])

  const handleCreateList = async (e) => {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return

    setCreatingList(true)
    setError('')

    try {
     const res = await createList({ title, board: id })
      const list = normalizeList(parseListResponse(res.data))
      if (list?.id) {
        setLists((prev) => [...prev, list])
      } else {
        await loadBoardData()
      }
      setNewListTitle('')
      setShowAddList(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create list')
    } finally {
      setCreatingList(false)
    }
  }

  const handleCardAdded = (listId, card) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, cards: [...list.cards, card] }
          : list
      )
    )
  }

  if (loading) {
    return (
      <div className="board-page board-page--loading">
        <div className="auth-bg" aria-hidden="true">
          <div className="auth-bg__orb auth-bg__orb--1" />
          <div className="auth-bg__orb auth-bg__orb--2" />
          <div className="auth-bg__orb auth-bg__orb--3" />
          <div className="auth-bg__grid" />
        </div>
        <div className="board-loading">
          <div className="board-loading__spinner" aria-hidden="true" />
          <p>Loading board…</p>
        </div>
      </div>
    )
  }

  if (!board && error) {
    return (
      <div className="board-page board-page--error">
        <div className="auth-bg" aria-hidden="true">
          <div className="auth-bg__orb auth-bg__orb--1" />
          <div className="auth-bg__grid" />
        </div>
        <div className="board-error-panel">
          <p>{error}</p>
          <Link to="/dashboard" className="board-back-link">
            Back to boards
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="board-page">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
        <div className="auth-bg__grid" />
      </div>

      <header className="board-header">
        <div className="board-header__inner">
          <div className="board-header__left">
            <Link to="/dashboard" className="board-back" aria-label="Back to boards">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div className="board-header__titles">
              <span className="board-header__breadcrumb">TaskFlow / Boards</span>
              <h1 className="board-header__title">{board?.title}</h1>
            </div>
          </div>
          <span className="board-header__badge">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'}
          </span>
        </div>
      </header>

      {error && (
        <div className="board-toast" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="board-canvas">
        <div className="board-lists">
          {lists.map((list, index) => (
            <ListColumn
              key={list.id}
              list={list}
              onCardAdded={handleCardAdded}
              onError={setError}
              style={{ '--list-delay': `${index * 70}ms` }}
            />
          ))}

          <div className={`list-add ${showAddList ? 'list-add--open' : ''}`}>
            {showAddList ? (
              <form className="list-add__form" onSubmit={handleCreateList}>
                <label className="list-add__label" htmlFor="list-title">
                  List title
                </label>
                <input
                  id="list-title"
                  type="text"
                  className="list-add__input"
                  placeholder="e.g. To Do"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  autoFocus
                  required
                />
                <div className="list-add__actions">
                  <button
                    type="submit"
                    className="list-add__submit"
                    disabled={creatingList}
                  >
                    {creatingList ? 'Adding…' : 'Add list'}
                  </button>
                  <button
                    type="button"
                    className="list-add__cancel"
                    onClick={() => {
                      setShowAddList(false)
                      setNewListTitle('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="list-add__trigger"
                onClick={() => setShowAddList(true)}
              >
                <span className="list-add__plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                Add another list
              </button>
            )}
          </div>
        </div>

        {lists.length === 0 && !showAddList && (
          <div className="board-empty">
            <div className="board-empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <p className="board-empty__title">No lists yet</p>
            <p className="board-empty__text">
              Create your first list to start adding cards with descriptions.
            </p>
            <button
              type="button"
              className="board-empty__btn"
              onClick={() => setShowAddList(true)}
            >
              Create your first list
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

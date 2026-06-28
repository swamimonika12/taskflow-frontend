import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import {
  createBoard,
  deleteBoard,
  getBoards,
  parseBoardResponse,
  parseBoardsResponse,
} from '../utils/api'
import '../styles/Dashboard.css'

function getBoardTitle(board) {
  return board?.title || board?.name || 'Untitled board'
}

function getInitials(user) {
  const name = user?.name || user?.email || '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function BoardSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="board-card board-card--skeleton" aria-hidden="true" />
      ))}
    </>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')

  const fetchBoards = async () => {
    setError('')
    try {
      const res = await getBoards()
      setBoards(parseBoardsResponse(res))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoards()
  }, [])

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    const title = newBoardTitle.trim()
    if (!title) return

    setCreating(true)
    setError('')

    try {
      const res = await createBoard({ title })
      const board = parseBoardResponse(res.data)
      if (board?.id) {
        setBoards((prev) => [...prev, board])
        setNewBoardTitle('')
        setShowCreateForm(false)
        navigate(`/list/${board._id}`)
      } else {
        await fetchBoards()
        setNewBoardTitle('')
        setShowCreateForm(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteBoard = async (e, board) => {
    e.stopPropagation()
    const title = getBoardTitle(board)
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return

    setDeletingId(board._id)
    setError('')

    try {
      await deleteBoard(board._id)
      setBoards((prev) => prev.filter((b) => b._id !== board._id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete board')
    } finally {
      setDeletingId(null)
    }
  }

  const displayName = user?.name || user?.email || 'there'

  return (
    <div className="dashboard">
      <div className="dashboard-bg" aria-hidden="true">
        <div className="dashboard-bg__orb dashboard-bg__orb--1" />
        <div className="dashboard-bg__orb dashboard-bg__orb--2" />
        <div className="dashboard-bg__orb dashboard-bg__orb--3" />
        <div className="dashboard-bg__grid" />
      </div>

      <header className="dashboard-header">
        <div className="dashboard-header__inner">
          <div className="dashboard-brand">
            <span className="dashboard-brand__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1.5" />
                <rect x="14" y="3" width="7" height="12" rx="1.5" />
              </svg>
            </span>
            <h1 className="dashboard-logo">TaskFlow</h1>
          </div>

          <div className="dashboard-header__actions">
            <div className="dashboard-user-pill">
              <span className="dashboard-avatar" aria-hidden="true">
                {getInitials(user)}
              </span>
              <span className="dashboard-user">
                <span className="dashboard-user__greeting">Welcome back</span>
                <span className="dashboard-user__name">{displayName}</span>
              </span>
            </div>
            <button type="button" className="dashboard-logout" onClick={logout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="dashboard-logout__label">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-main__inner">
          <div className="dashboard-hero">
            <h2 className="dashboard-title">Your boards</h2>
            <p className="dashboard-subtitle">
              Pick a board to continue, or start something new.
            </p>
          </div>

          {error && (
            <div className="dashboard-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="board-grid">
            <div
              className={`board-create ${showCreateForm ? 'board-create--active' : ''}`}
            >
              {showCreateForm ? (
                <form className="board-create__form" onSubmit={handleCreateBoard}>
                  <label className="board-create__label" htmlFor="board-title">
                    Board title
                  </label>
                  <input
                    id="board-title"
                    type="text"
                    className="board-create__input"
                    placeholder="e.g. Product roadmap"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    autoFocus
                    required
                  />
                  <div className="board-create__actions">
                    <button
                      type="submit"
                      className="board-create__submit"
                      disabled={creating}
                    >
                      {creating ? 'Creating…' : 'Create board'}
                    </button>
                    <button
                      type="button"
                      className="board-create__cancel"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewBoardTitle('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="board-create__trigger"
                  onClick={() => setShowCreateForm(true)}
                  disabled={loading}
                >
                  <span className="board-create__plus" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                  <span className="board-create__text">Create new board</span>
                </button>
              )}
            </div>

            {loading && <BoardSkeleton />}

            {!loading &&
              boards.map((board, index) => (
                <article
                  key={board._id ?? index}
                  className="board-card"
                  style={{ '--card-delay': `${index * 60}ms` }}
                >
                  <button
                    type="button"
                    className="board-card__open"
                    onClick={() => navigate(`/list/${board._id}`)}
                  >
                    <span className="board-card__title">{getBoardTitle(board)}</span>
                    <span className="board-card__hint">Open board</span>
                  </button>
                  <button
                    type="button"
                    className="board-card__delete"
                    onClick={(e) => handleDeleteBoard(e, board)}
                    disabled={deletingId === board._id}
                    aria-label={`Delete ${getBoardTitle(board)}`}
                    title="Delete board"
                  >
                    {deletingId === board._id ? (
                      <span className="board-card__delete-spinner" aria-hidden="true" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                </article>
              ))}
          </div>

          {!loading && boards.length === 0 && !showCreateForm && (
            <div className="dashboard-empty">
              <div className="dashboard-empty__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="18" rx="1.5" />
                  <rect x="14" y="3" width="7" height="12" rx="1.5" />
                </svg>
              </div>
              <p className="dashboard-empty__title">No boards yet</p>
              <p className="dashboard-empty__text">
                Your workspace is ready. Create your first board to organize tasks.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

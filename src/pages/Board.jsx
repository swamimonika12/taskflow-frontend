import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import {
  createList,
  getBoard,
  getListsByBoard,
  parseBoardDetail,
  parseListResponse,
  parseListsResponse,
} from '../utils/api'
import '../styles/Board.css'

function getListTitle(list) {
  return list?.title || list?.name || 'Untitled list'
}

function getBoardTitle(board) {
  return board?.title || board?.name || 'Board'
}

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

const parseBoardDetail = (data) => {
  return {
    board: {
      id: data.data.data._id,
      name: data.data.data.title,
    },
    lists: data.data.data.lists || []
  }
}

const loadBoardData = async () => {
  setError('')
  try {
    const boardRes = await getBoard(id)
    const { board: boardData, lists: embeddedLists } = parseBoardDetail(boardRes)
    setBoard(boardData)
    setLists(embeddedLists)
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load board')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadBoardData()
  }, [id])

  const handleCreateList = async (e) => {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return

    setCreatingList(true)
    setError('')

    try {
      const res = await createList({ title, boardId: id, board_id: id })
      const list = parseListResponse(res.data)
      if (list?.id) {
        setLists((prev) => [...prev, list])
      } else {
        const listsRes = await getListsByBoard(id)
        
        setLists(parseListsResponse(listsRes.data))
      }
      setNewListTitle('')
      setShowAddList(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create list')
    } finally {
      setCreatingList(false)
    }
  }

  if (loading) {
    return (
      <div className="board-page board-page--loading">
        <div className="board-page__loader" aria-label="Loading board" />
      </div>
    )
  }

  if (!board && error) {
    return (
      <div className="board-page board-page--error">
        <p>{error}</p>
        <Link to="/dashboard" className="board-back-link">
          Back to boards
        </Link>
      </div>
    )
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <div className="board-header__inner">
          <div className="board-header__left">
            <Link to="/dashboard" className="board-back" aria-label="Back to boards">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <h1 className="board-header__title">{getBoardTitle(board)}</h1>
          </div>
        </div>
      </header>

      {error && (
        <div className="board-error" role="alert">
          {error}
        </div>
      )}

      <div className="board-canvas">
        <div className="board-lists">
          {lists.map((list) => (
            <section key={list.id} className="list-column">
              <header className="list-column__header">
                <h2 className="list-column__title">{getListTitle(list)}</h2>
              </header>
              <div className="list-column__body">
                {(list.cards || list.tasks || []).length === 0 && (
                  <p className="list-column__empty">No cards yet</p>
                )}
                {(list.cards || list.tasks || []).map((card) => (
                  <article key={card.id} className="list-card">
                    <p className="list-card__title">
                      {card.title || card.name || 'Untitled'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <div className={`list-add ${showAddList ? 'list-add--open' : ''}`}>
            {showAddList ? (
              <form className="list-add__form" onSubmit={handleCreateList}>
                <input
                  type="text"
                  className="list-add__input"
                  placeholder="List title"
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
                + Add another list
              </button>
            )}
          </div>
        </div>

        {lists.length === 0 && !showAddList && (
          <div className="board-empty">
            <p>No lists on this board yet.</p>
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

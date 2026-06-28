export function getId(item) {
  return item?.id ?? item?._id ?? null
}

export function normalizeCard(card) {
  if (!card) return null
  return {
    id: getId(card),
    title: card.title || card.name || 'Untitled',
    description: card.description || card.desc || '',
  }
}

export function normalizeCards(cards) {
  if (!Array.isArray(cards)) return []
  return cards.map(normalizeCard).filter(Boolean)
}

export function normalizeList(list) {
  if (!list) return null
  return {
    id: getId(list),
    title: list.title || list.name || 'Untitled list',
    cards: normalizeCards(list.cards || list.tasks || []),
  }
}

export function normalizeLists(lists) {
  if (!Array.isArray(lists)) return []
  return lists.map(normalizeList).filter(Boolean)
}

export function normalizeBoard(board) {
  if (!board) return null
  return {
    id: getId(board),
    title: board.title || board.name || 'Board',
  }
}

export function parseBoardDetailResponse(response) {
  const payload = response?.data
  const nested = payload?.data?.data ?? payload?.data ?? payload
  const boardRaw = nested?.board ?? nested

  const board = normalizeBoard({
    _id: boardRaw?._id ?? boardRaw?.id,
    title: boardRaw?.title ?? boardRaw?.name,
    name: boardRaw?.name,
  })

  const lists = normalizeLists(
    nested?.lists ?? boardRaw?.lists ?? payload?.lists ?? []
  )

  return { board, lists }
}

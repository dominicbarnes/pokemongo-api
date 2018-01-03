
const Case = require('case')

module.exports = function (data) {
  const m = new Map()

  data.get('itemSettings').forEach(item => {
    const id = item.itemId
    // TODO: add "food" data

    m.set(id, {
      id: id,
      type: item.itemType,
      category: item.category,
      name: Case.title(id.replace('ITEM_', ''))
    })
  })

  return m
}


const Case = require('case')

module.exports = function (data) {
  return data.itemSettings.map(function (item) {
    const id = item.itemId
    const type = item.itemType
    const category = item.category
    const name = Case.title(id.replace('ITEM_', ''))
    // TODO: add "food" data
    return { id, type, category, name }
  })
}

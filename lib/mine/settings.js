
module.exports = function (m, data) {
    data.get('playerLevel').forEach(function (playerLevel) {
        m.set('CP_MULTIPLIERS', { levels: cpMultipliers(playerLevel) })
    })
}

function cpMultipliers(settings) {
    return settings.cpMultiplier.reduce(function (acc, mult, x, arr) {
        const level = x + 1
        acc[level] = mult
        if (level < 40) {
            acc[level + 0.5] = Math.sqrt((Math.pow(mult, 2) + Math.pow(arr[x+1], 2)) / 2).toPrecision(9)
        }
        return acc
    }, Object.create(null))
}

const { DateTime } = require("luxon");

module.exports = {
  utcDate: DateTime.now({zone: 'utc'}).toJSDate()
}

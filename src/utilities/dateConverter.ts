export const dateConverter = (message: string) => {
  const REGEX = /(?<hour>[012]?\d):(?<minute>[012345]\d)\s?(?<ampm>[AP]M)\s?PD?T/i

  const match = message.match(REGEX)
  if (!match || !match.groups) return null
  const { groups } = match

  const today = new Date()
  const { ampm } = groups

  let realHour = parseInt(groups.hour, 10)
  if (ampm === 'PM' && realHour < 12) realHour = realHour + 12
  else if (ampm === 'AM' && realHour === 12) realHour = realHour - 12

  const dateInUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate(), Number(realHour) + 7, Number(groups.minute) - today.getTimezoneOffset())

  return dateInUTC
}

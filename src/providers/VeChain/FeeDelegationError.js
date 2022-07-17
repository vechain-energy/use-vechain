export default class FeeDelegationError extends Error {
  constructor (message, errors) {
    super(message)
    this.name = 'FeeDelegationError'
    this.errors = errors
  }
}

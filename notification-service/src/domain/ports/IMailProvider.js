/**
 * @interface IMailProvider
 *
 * Contract for sending emails.
 * Implementations: MailProvider
 */

class IMailProvider {
  /**
   * @param {object} opts
   * @param {string} opts.to
   * @param {string} opts.subject
   * @param {string} opts.html
   * @returns {Promise<object>}
   */
  async sendMail({ to, subject, html }) { throw new Error('Not implemented'); }
}

module.exports = { IMailProvider };

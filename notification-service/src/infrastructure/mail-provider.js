const nodemailer = require('nodemailer');

/** @implements {import('../domain/ports/IMailProvider').IMailProvider} */
class MailProvider {
  constructor(host, port) {
    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false,
    });
  }

  async sendMail({ to, subject, html }) {
    return await this.transporter.sendMail({
      from: '"E-Shop Store" <no-reply@ecom.com>',
      to,
      subject,
      html,
    });
  }
}

module.exports = MailProvider;

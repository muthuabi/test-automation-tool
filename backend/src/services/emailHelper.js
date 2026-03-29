const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailHelper {
  constructor(config) {
    this.config = config;
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter
   */
  async initialize() {
    try {
      if (this.initialized) return true;

      // Support for different email service providers
      if (this.config.service === 'smtp') {
        this.transporter = nodemailer.createTransport({
          host: this.config.smtpHost,
          port: this.config.smtpPort,
          secure: this.config.secure || false,
          auth: {
            user: this.config.username,
            pass: this.config.password
          }
        });
      } else if (this.config.service === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.config.username,
            pass: this.config.appPassword // Gmail app password, not regular password
          }
        });
      } else if (this.config.service === 'office365') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.office365.com',
          port: 587,
          secure: false,
          auth: {
            user: this.config.username,
            pass: this.config.password
          }
        });
      } else {
        throw new Error(`Unsupported email service: ${this.config.service}`);
      }

      // Test connection
      await this.transporter.verify();
      this.initialized = true;
      logger.info('[EMAIL] Email service initialized and verified');
      return true;
    } catch (error) {
      logger.error(`[EMAIL] Failed to initialize email service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate email configuration
   */
  async validateConfig() {
    try {
      if (!this.config.service || !this.config.username || !this.config.password) {
        throw new Error('Missing required email configuration: service, username, password');
      }

      await this.initialize();
      return { valid: true, message: 'Email configuration is valid' };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        details: 'Please verify your email service configuration'
      };
    }
  }

  /**
   * Send execution summary email
   */
  async sendExecutionSummary(executionData, recipients) {
    try {
      await this.initialize();

      logger.info(`[EMAIL] Sending execution summary to ${recipients.join(', ')}`);

      const html = this.generateExecutionSummaryHtml(executionData);

      const mailOptions = {
        from: this.config.senderName ? `${this.config.senderName} <${this.config.username}>` : this.config.username,
        to: recipients.join(', '),
        subject: `Test Execution Report - ${executionData.scenarioName || 'Automation Run'}`,
        html
      };

      // Attach logs if available
      if (executionData.logs && executionData.logs.length > 0) {
        mailOptions.attachments = [{
          filename: 'execution_logs.txt',
          content: executionData.logs.join('\n')
        }];
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Email sent successfully: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        recipients
      };
    } catch (error) {
      logger.error(`[EMAIL] Error sending email: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate HTML for execution summary
   */
  generateExecutionSummaryHtml(executionData) {
    const totalFunctions = executionData.functions ? executionData.functions.length : 0;
    const passedCount = executionData.functions ? executionData.functions.filter(f => f.status === 'success').length : 0;
    const failedCount = totalFunctions - passedCount;
    const passRate = totalFunctions > 0 ? ((passedCount / totalFunctions) * 100).toFixed(2) : 0;

    let functionsHtml = '<tr><td colspan="4">No functions executed</td></tr>';
    if (executionData.functions && executionData.functions.length > 0) {
      functionsHtml = executionData.functions.map((func, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${func.functionName || 'N/A'}</td>
          <td style="color: ${func.status === 'success' ? '#22c55e' : '#ef4444'}">${func.status.toUpperCase()}</td>
          <td>${func.duration || 0}ms</td>
        </tr>
      `).join('');
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
            .summary-card { background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .summary-card.pass { border-left-color: #22c55e; }
            .summary-card.fail { border-left-color: #ef4444; }
            .summary-value { font-size: 24px; font-weight: bold; }
            .summary-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            thead { background-color: #f3f4f6; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Test Execution Report</h2>
            <p><strong>Scenario:</strong> ${executionData.scenarioName || 'N/A'}</p>
            <p><strong>Executed at:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-value">${totalFunctions}</div>
              <div class="summary-label">Total Functions</div>
            </div>
            <div class="summary-card pass">
              <div class="summary-value">${passedCount}</div>
              <div class="summary-label">Passed</div>
            </div>
            <div class="summary-card fail">
              <div class="summary-value">${failedCount}</div>
              <div class="summary-label">Failed</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${passRate}%</div>
              <div class="summary-label">Pass Rate</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Function Name</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${functionsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>This is an automated report from Test Automation Tool. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send custom email
   */
  async sendEmail(to, subject, body, isHtml = false) {
    try {
      await this.initialize();

      logger.info(`[EMAIL] Sending email to ${Array.isArray(to) ? to.join(', ') : to}`);

      const mailOptions = {
        from: this.config.senderName ? `${this.config.senderName} <${this.config.username}>` : this.config.username,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        [isHtml ? 'html' : 'text']: body
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Email sent successfully: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      logger.error(`[EMAIL] Error sending email: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Publish execution results via email
   */
  async publishExecutionResults(executionData) {
    try {
      if (!this.config.recipients || this.config.recipients.length === 0) {
        logger.warn('[EMAIL] No email recipients configured');
        return { success: false, error: 'No email recipients configured' };
      }

      const result = await this.sendExecutionSummary(executionData, this.config.recipients);
      return result;
    } catch (error) {
      logger.error(`[EMAIL] Error publishing results: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = EmailHelper;

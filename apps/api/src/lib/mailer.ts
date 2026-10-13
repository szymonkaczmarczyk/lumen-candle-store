import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export function createResendMailer(apiKey: string, from: string): Mailer {
  const resend = new Resend(apiKey);
  return {
    async send(message) {
      const { error } = await resend.emails.send({ from, ...message });
      if (error) throw new Error(`Resend error: ${error.message}`);
    },
  };
}

export function createFileMailer(directory: string): Mailer {
  return {
    async send(message) {
      await mkdir(directory, { recursive: true });
      const safeRecipient = message.to.replace(/[^a-z0-9@._-]/gi, "_");
      const fileName = `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeRecipient}.html`;
      await writeFile(path.join(directory, fileName), message.html, "utf8");
    },
  };
}

export function createMemoryMailer(): Mailer & { sent: MailMessage[] } {
  const sent: MailMessage[] = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
    },
  };
}

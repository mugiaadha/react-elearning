<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DynamicTemplateMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $renderedSubject;
    public string $renderedHtml;
    public ?string $renderedText;

    /**
     * Create a new message instance.
     */
    public function __construct(string $subject, string $html, ?string $text = null)
    {
        $this->renderedSubject = $subject;
        $this->renderedHtml = $html;
        $this->renderedText = $text;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $fromAddress = config('mail.from.address', 'no-reply@nactaxcenter.id');
        $fromName = config('mail.from.name', 'NAC Tax Center');

        $mail = $this->from($fromAddress, $fromName)
                     ->subject($this->renderedSubject)
                     ->html($this->renderedHtml);

        if (!empty($this->renderedText)) {
            $mail->text($this->renderedText);
        }

        return $mail;
    }
}

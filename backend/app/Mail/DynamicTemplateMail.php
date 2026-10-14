<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DynamicTemplateMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * Number of seconds to wait before retrying the job (30 minutes).
     */
    public int $backoff = 1800;

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

        return $this->from($fromAddress, $fromName)
                    ->subject($this->renderedSubject)
                    ->html($this->renderedHtml);
    }
}

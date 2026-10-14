<?php

namespace App\Jobs;

use App\Mail\DynamicTemplateMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendTemplateEmailJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 10;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 1800;

    /**
     * The number of seconds after which the unique job lock will be released.
     * Prevents duplicate emails if fired multiple times within 60 seconds.
     */
    public int $uniqueFor = 60;

    public string $toEmail;
    public string $templateSlug;
    public array $rendered;
    public ?string $toName;

    /**
     * Create a new job instance.
     */
    public function __construct(string $toEmail, string $templateSlug, array $rendered, ?string $toName = null)
    {
        $this->toEmail = $toEmail;
        $this->templateSlug = $templateSlug;
        $this->rendered = $rendered;
        $this->toName = $toName;
    }

    /**
     * Get the unique ID for the job lock.
     * Combines destination email + template slug so duplicate sends are dropped.
     */
    public function uniqueId(): string
    {
        return strtolower(trim($this->toEmail)) . ':' . trim($this->templateSlug);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $mailable = new DynamicTemplateMail(
            $this->rendered['subject'],
            $this->rendered['body_html'],
            $this->rendered['body_text'] ?? null
        );

        Mail::to($this->toEmail, $this->toName)->send($mailable);

        Log::info("Queued email dispatched successfully to {$this->toEmail} for template '{$this->templateSlug}'.");
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'subject',
        'body_html',
        'body_text',
        'placeholders',
        'is_active',
    ];

    protected $casts = [
        'placeholders' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Render the template by replacing {{placeholders}} with provided dynamic data.
     *
     * @param array $variables
     * @return array ['subject' => string, 'body_html' => string, 'body_text' => string]
     */
    public function render(array $variables = []): array
    {
        // Global default placeholders
        $defaults = [
            'app_name' => config('app.name', 'NAC Tax Center'),
            'app_url' => config('app.url', 'http://localhost:5173'),
            'year' => date('Y'),
            'support_email' => 'admisi@nactaxcenter.id',
            'support_phone' => '+62 812-8890-4123',
        ];

        $mergedVariables = array_merge($defaults, $variables);

        $subject = $this->subject;
        $html = $this->body_html;
        $text = $this->body_text ?: strip_tags($this->body_html);

        foreach ($mergedVariables as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $valString = is_scalar($value) ? (string) $value : json_encode($value);

            $subject = str_replace($placeholder, $valString, $subject);
            $html = str_replace($placeholder, $valString, $html);
            $text = str_replace($placeholder, $valString, $text);
        }

        return [
            'subject' => $subject,
            'body_html' => $html,
            'body_text' => $text,
        ];
    }
}

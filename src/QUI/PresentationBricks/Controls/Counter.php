<?php

/**
 * This file contains \QUI\PresentationBricks\Controls\Counter
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class Counter
 *
 * @package quiqqer/presentation-bricks
 */
class Counter extends QUI\Control
{
    private const DEFAULT_TEMPLATE = 'stacked-center';

    private const TEMPLATES = [
        'inline-left' => [
            'baseLayout' => 'inline',
            'alignment' => 'left',
            'template' => 'vertical'
        ],
        'inline-center' => [
            'baseLayout' => 'inline',
            'alignment' => 'center',
            'template' => 'vertical'
        ],
        'stacked-left' => [
            'baseLayout' => 'stacked',
            'alignment' => 'left',
            'template' => 'vertical'
        ],
        'stacked-center' => [
            'baseLayout' => 'stacked',
            'alignment' => 'center',
            'template' => 'vertical'
        ],
        'horizontal' => [
            'baseLayout' => 'horizontal',
            'alignment' => '',
            'template' => 'horizontal'
        ]
    ];

    private const GAP_PRESETS = [
        'none' => 'clamp(0rem, 0vw, 0rem)',
        'xs' => 'clamp(0.5rem, 0.45rem + 0.2vw, 0.65rem)',
        's' => 'clamp(0.75rem, 0.7rem + 0.25vw, 0.95rem)',
        'normal' => 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)',
        'large' => 'clamp(1.5rem, 1.3rem + 0.8vw, 2.25rem)',
        'extraLarge' => 'clamp(2rem, 1.7rem + 1vw, 3rem)'
    ];

    private const NUMBER_SIZE_PRESETS = [
        'small' => 'clamp(1.25rem, 1rem + 1vw, 2rem)',
        'normal' => 'clamp(1.5rem, 1.1rem + 1.8vw, 3rem)',
        'large' => 'clamp(1.75rem, 1.3rem + 2.4vw, 3.75rem)',
        'xlarge' => 'clamp(2rem, 1.5rem + 3vw, 4.5rem)'
    ];

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-presentationBricks-counter',
            'entries' => [],
            'template' => self::DEFAULT_TEMPLATE,
            'duration' => 2500,
            'columns' => 3,
            'maxWidth' => '',
            'itemMaxWidth' => '',
            'gap' => 'normal',
            'numberSize' => 'normal',
            'accentColor' => ''
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(dirname(__FILE__) . '/Counter.css');
    }

    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $template = $this->getTemplateName();
        $duration = $this->getDuration();
        $columns = $this->getColumns();
        $maxWidth = $this->sanitizeCssLength((string)$this->getAttribute('maxWidth'));
        $itemMaxWidth = $this->sanitizeCssLength((string)$this->getAttribute('itemMaxWidth'));
        $gap = $this->getGapPresetValue();
        $numberSize = $this->getNumberSizePresetValue();
        $accentColor = $this->sanitizeCssColor((string)$this->getAttribute('accentColor'));

        if ($maxWidth !== '') {
            $this->setCustomVariable('maxWidth', $maxWidth);
        }

        if ($itemMaxWidth !== '') {
            $this->setCustomVariable('itemMaxWidth', $itemMaxWidth);
        }

        if ($gap !== '') {
            $this->setCustomVariable('gap', $gap);
        }

        if ($numberSize !== '') {
            $this->setCustomVariable('numberSize', $numberSize);
        }

        if ($accentColor !== '') {
            $this->setCustomVariable('accentColor', $accentColor);
        }

        $this->setCustomVariable('columns', (string)$columns);
        $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/Counter');
        $this->setJavaScriptControlOption('duration', $duration);

        $Engine->assign([
            'this' => $this,
            'entries' => $this->getNormalizedEntries(),
            'templateVariant' => $this->getTemplateVariant(),
            'layoutModifierClasses' => $this->getLayoutModifierClasses(),
            'template' => $template,
            'duration' => $duration
        ]);

        $this->addCSSFile(dirname(__FILE__) . '/Counter.' . $template . '.css');

        return $Engine->fetch(dirname(__FILE__) . '/Counter.' . $template . '.html');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function getNormalizedEntries(): array
    {
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        if (!is_array($entries)) {
            return [];
        }

        $result = [];

        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            if (!empty($entry['disabled']) || !empty($entry['isDisabled'])) {
                continue;
            }

            $icon = isset($entry['icon']) ? trim((string)$entry['icon']) : '';
            $endValue = $this->normalizeNumber($entry['endValue'] ?? 0);
            $prefix = isset($entry['prefix']) ? (string)$entry['prefix'] : '';
            $numberAddon = isset($entry['numberAddon']) ? (string)$entry['numberAddon'] : '';
            $suffix = isset($entry['suffix']) ? (string)$entry['suffix'] : '';

            $result[] = [
                'startValue' => $this->normalizeNumber($entry['startValue'] ?? 0),
                'endValue' => $endValue,
                'prefix' => $prefix,
                'numberAddon' => $numberAddon,
                'suffix' => $suffix,
                'icon' => $icon,
                'title' => isset($entry['title']) ? (string)$entry['title'] : '',
                'content' => isset($entry['content']) ? (string)$entry['content'] : '',
                'hasIcon' => $icon !== '',
                'accessibleValue' => $this->getAccessibleValue($prefix, $endValue, $numberAddon, $suffix)
            ];
        }

        return $result;
    }

    /**
     * Builds the stable, screen-reader friendly value: the final number
     * formatted for the current locale, combined with prefix, addon and suffix.
     * The visually animated number is hidden from assistive technology, so this
     * value is what gets announced (and what crawlers read from the DOM).
     *
     * @param float|int $endValue
     */
    private function getAccessibleValue(string $prefix, $endValue, string $numberAddon, string $suffix): string
    {
        $parts = array_filter(
            [
                trim($prefix),
                QUI::getLocale()->formatNumber($endValue),
                trim($numberAddon),
                trim($suffix)
            ],
            static fn(string $part): bool => $part !== ''
        );

        return implode(' ', $parts);
    }

    protected function getTemplateName(): string
    {
        $templateConfig = $this->getTemplateConfiguration();

        return $templateConfig['template'];
    }

    /**
     * @return array{baseLayout: string, alignment: string, template: string}
     */
    protected function getTemplateConfiguration(): array
    {
        $template = $this->getAttribute('template');

        if (!is_string($template) || !isset(self::TEMPLATES[$template])) {
            return self::TEMPLATES[self::DEFAULT_TEMPLATE];
        }

        return self::TEMPLATES[$template];
    }

    protected function getTemplateVariant(): string
    {
        $template = $this->getAttribute('template');

        if (!is_string($template) || !isset(self::TEMPLATES[$template])) {
            return self::DEFAULT_TEMPLATE;
        }

        return $template;
    }

    protected function getLayoutModifierClasses(): string
    {
        $templateConfig = $this->getTemplateConfiguration();
        $classes = [
            'quiqqer-presentationBricks-counter--layout-' . $templateConfig['baseLayout']
        ];

        if ($templateConfig['alignment'] !== '') {
            $classes[] = 'quiqqer-presentationBricks-counter--align-' . $templateConfig['alignment'];
        }

        return implode(' ', $classes);
    }

    protected function getGapPresetValue(): string
    {
        $preset = $this->getAttribute('gap');

        if (!is_string($preset) || !isset(self::GAP_PRESETS[$preset])) {
            return self::GAP_PRESETS['normal'];
        }

        return self::GAP_PRESETS[$preset];
    }

    protected function getNumberSizePresetValue(): string
    {
        $preset = $this->getAttribute('numberSize');

        if (!is_string($preset) || !isset(self::NUMBER_SIZE_PRESETS[$preset])) {
            return self::NUMBER_SIZE_PRESETS['normal'];
        }

        return self::NUMBER_SIZE_PRESETS[$preset];
    }

    private function getDuration(): int
    {
        $duration = (int)$this->getAttribute('duration');

        return $duration > 0 ? $duration : 2500;
    }

    private function getColumns(): int
    {
        $columns = (int)$this->getAttribute('columns');

        if ($columns < 1 || $columns > 6) {
            return 3;
        }

        return $columns;
    }

    /**
     * @param mixed $value
     * @return float|int
     */
    private function normalizeNumber($value)
    {
        if (is_string($value)) {
            $value = str_replace(',', '.', trim($value));
        }

        if (!is_numeric($value)) {
            return 0;
        }

        $number = (float)$value;

        if ((float)(int)$number === $number) {
            return (int)$number;
        }

        return $number;
    }

    private function sanitizeCssLength(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?[a-zA-Z%]*$/', $value) !== 1) {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?$/', $value) === 1) {
            return $value . 'px';
        }

        return $value;
    }

    private function sanitizeCssColor(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return '';
        }

        if (preg_match('/^#[0-9A-Fa-f]{3,8}$/', $value) !== 1) {
            return '';
        }

        return $value;
    }

    private function setCustomVariable(string $name, string $value): void
    {
        if ($name === '' || $value === '') {
            return;
        }

        $this->setStyle('--_q-controlConf-' . $name, $value);
    }
}
